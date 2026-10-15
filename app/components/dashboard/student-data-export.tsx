"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileJson, Send, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { useAuth } from "@/lib/auth-context";
import {
  listUsers,
  listAttemptsByStudent,
  listEnrollments,
  listAttendanceDays,
  listCertificates,
} from "@/lib/db";
import { subjectMarks } from "@/lib/gradebook";
import { learnerClassNames } from "@/lib/learners";
import { toCsv, downloadCsv } from "@/lib/csv";
import { averagePercent, passRate, formatDate } from "@/lib/utils";
import type { Attempt, Certificate, Enrollment, UserProfile } from "@/lib/types";

interface Bundle {
  student: UserProfile;
  attempts: Attempt[];
  enrollments: Enrollment[];
  attendance: string[];
  certificates: Certificate[];
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StudentDataExport({ role }: { role: "admin" | "teacher" }) {
  const { institution, profile } = useAuth();
  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const users = await listUsers(institution.id, "student");
      // Teachers export only students in their assigned classes (when set).
      const scoped =
        role === "teacher" && profile.classes?.length
          ? users.filter((s) =>
              learnerClassNames(s).some((c) => profile.classes!.includes(c)),
            )
          : users;
      setAllStudents(scoped);
      setLoading(false);
    })();
  }, [institution, profile, role]);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of allStudents) {
      learnerClassNames(s).forEach((c) => set.add(c));
    }
    return [...set].sort();
  }, [allStudents]);

  const visibleStudents = useMemo(() => {
    if (!classFilter) return allStudents;
    return allStudents.filter((s) => learnerClassNames(s).includes(classFilter));
  }, [allStudents, classFilter]);

  const selectedStudents = allStudents.filter((s) => selectedIds.includes(s.uid));

  const buildBundles = async (): Promise<Bundle[]> => {
    if (!institution) return [];
    const out: Bundle[] = [];
    for (const student of selectedStudents) {
      const [attempts, enrollments, attendance, certificates] = await Promise.all([
        listAttemptsByStudent(institution.id, student.uid),
        listEnrollments(institution.id, student.uid),
        listAttendanceDays(institution.id, student.uid),
        listCertificates(institution.id, student.uid),
      ]);
      out.push({ student, attempts, enrollments, attendance, certificates });
    }
    return out;
  };

  const exportJson = async () => {
    if (selectedStudents.length === 0) return toast.error("Select students first.");
    setBusy("json");
    try {
      const bundles = await buildBundles();
      const payload = bundles.map((b) => ({
        profile: {
          name: b.student.name,
          email: b.student.email,
          classes: learnerClassNames(b.student),
          externalId: b.student.externalId,
          parentEmail: b.student.parentEmail,
        },
        summary: {
          averagePercent: averagePercent(b.attempts),
          passRatePercent: passRate(b.attempts),
          attemptCount: b.attempts.filter((a) => a.status !== "in_progress").length,
          attendanceDays: b.attendance.length,
          subjects: subjectMarks(b.attempts),
        },
        enrollments: b.enrollments,
        certificates: b.certificates,
        attendanceDays: b.attendance,
        attempts: b.attempts,
      }));
      downloadJson(`exampro-students-${Date.now()}.json`, payload);
      toast.success(`Exported ${bundles.length} student record(s).`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy("");
    }
  };

  const exportCsv = async () => {
    if (selectedStudents.length === 0) return toast.error("Select students first.");
    setBusy("csv");
    try {
      const bundles = await buildBundles();
      const rows: (string | number | undefined)[][] = [];
      for (const b of bundles) {
        for (const a of b.attempts.filter((x) => x.status !== "in_progress")) {
          a.perQuestion.forEach((q, i) => {
            rows.push([
              b.student.name,
              b.student.email,
              a.assessmentTitle,
              a.assessmentKind,
              a.subject,
              a.className,
              `Q${i + 1}`,
              q.pointsAwarded,
              q.maxPoints,
              q.correct === null ? "manual" : q.correct ? "yes" : "no",
              formatDate(a.submittedAt ?? a.startedAt),
            ]);
          });
        }
      }
      downloadCsv(
        `exampro-students-${Date.now()}.csv`,
        toCsv(
          [
            "student",
            "email",
            "assessment",
            "kind",
            "subject",
            "class",
            "question",
            "pointsAwarded",
            "maxPoints",
            "correct",
            "date",
          ],
          rows,
        ),
      );
      toast.success(`Exported ${rows.length} rows.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy("");
    }
  };

  const sendToParents = async () => {
    if (!institution) return;
    const targets = selectedStudents.filter((s) => s.parentEmail?.trim());
    if (targets.length === 0) {
      return toast.error("Selected students have no parent email on file.");
    }
    setBusy("email");
    let sent = 0;
    try {
      const bundles = await buildBundles();
      for (const b of bundles) {
        if (!b.student.parentEmail?.trim()) continue;
        const avg = averagePercent(b.attempts);
        const pr = passRate(b.attempts);
        const marks = subjectMarks(b.attempts);
        const subjectLines = marks
          .map(
            (m) =>
              `<li>${m.subject} (${m.className}): <strong>${m.percent}%</strong></li>`,
          )
          .join("");
        const html = `
          <div style="font-family:ui-sans-serif,system-ui;line-height:1.6;color:#111">
            <h2 style="margin:0 0 4px">Progress summary for ${escapeHtml(b.student.name)}</h2>
            <p style="color:#6b7280;margin:0 0 16px">${escapeHtml(institution.name)} · ${formatDate(Date.now())}</p>
            <p><strong>Overall average:</strong> ${avg === null ? "No graded work yet" : `${avg}%`}</p>
            <p><strong>Pass rate:</strong> ${pr === null ? "—" : `${pr}%`}</p>
            <p><strong>Attendance:</strong> ${b.attendance.length} day(s) active</p>
            ${subjectLines ? `<p style="margin-top:12px"><strong>By subject:</strong></p><ul>${subjectLines}</ul>` : ""}
            ${b.certificates.length ? `<p style="margin-top:12px"><strong>Certificates:</strong> ${b.certificates.map((c) => c.title).join(", ")}</p>` : ""}
            <p style="margin-top:16px;color:#6b7280;font-size:13px">Log in anytime to see full details.</p>
          </div>`;
        const res = await fetch("/api/email/parent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: [b.student.parentEmail.trim()],
            subject: `${b.student.name}'s progress summary — ${institution.name}`,
            html,
            schoolName: institution.name,
            replyTo: profile?.email,
          }),
        });
        if (res.ok || res.status === 207) sent += 1;
        else {
          const d = await res.json().catch(() => null);
          console.error("parent summary send failed", d?.error);
        }
      }
      if (sent > 0) toast.success(`Sent ${sent} parent summary(s).`);
      else toast.error("No summaries could be delivered.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--dash-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--dash-text)]">
              Select students
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex justify-end">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-md border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-1 text-xs"
            >
              <option value="">All classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="h-24 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse" />
          ) : (
            <StudentPicker
              students={visibleStudents}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
          )}
          <p className="text-xs text-[var(--dash-text-faint)]">
            {selectedIds.length} selected · each export includes profile, enrollments,
            every attempt with per-question scores, attendance and certificates.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              loading={busy === "csv"}
              disabled={selectedIds.length === 0}
              onClick={() => void exportCsv()}
            >
              <Download className="w-4 h-4" /> Download CSV
            </Button>
            <Button
              variant="outline"
              loading={busy === "json"}
              disabled={selectedIds.length === 0}
              onClick={() => void exportJson()}
            >
              <FileJson className="w-4 h-4" /> Download JSON
            </Button>
            <Button
              loading={busy === "email"}
              disabled={selectedIds.length === 0}
              onClick={() => void sendToParents()}
            >
              <Send className="w-4 h-4" /> Send summary to parents
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
