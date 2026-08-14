"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAttemptsByTeacher } from "@/lib/db";
import type { Attempt } from "@/lib/types";
import { formatDateTime, inputClass, KIND_LABEL } from "@/lib/utils";

export default function TeacherSubmissionsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("all");

  useEffect(() => {
    if (!institution || !profile) return;
    listAttemptsByTeacher(institution.id, profile.uid).then((a) => {
      setItems(a.filter((x) => x.status !== "in_progress"));
      setLoading(false);
    });
  }, [institution, profile]);

  const filtered = items.filter((a) => {
    if (filter === "pending") return a.needsManualGrading && a.status !== "graded";
    if (filter === "graded") return a.status === "graded" || !a.needsManualGrading;
    return true;
  });

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Submissions"
      subtitle="Review auto-graded work and mark essays / coding by hand"
    >
      <div className="space-y-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className={`${inputClass} w-auto`}
        >
          <option value="all">All submissions</option>
          <option value="pending">Needs grading</option>
          <option value="graded">Graded</option>
        </select>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">{filtered.length} submissions</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="w-6 h-6" />}
                title="No submissions yet"
                description="Student attempts will show up here after they submit."
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Assessment</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Submitted</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td className="px-6 py-3 font-medium">{a.studentName}</td>
                      <td className="px-6 py-3">{a.assessmentTitle}</td>
                      <td className="px-6 py-3">{KIND_LABEL[a.assessmentKind]}</td>
                      <td className="px-6 py-3">
                        {Math.round(a.score)}/{a.maxScore} ({Math.round(a.percent)}%)
                      </td>
                      <td className="px-6 py-3">
                        {a.needsManualGrading && a.status !== "graded" ? (
                          <Badge variant="warning">Needs grading</Badge>
                        ) : (
                          <Badge variant={a.passed ? "success" : "danger"}>
                            {a.passed ? "Pass" : "Fail"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {formatDateTime(a.submittedAt)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/dashboard/teacher/submissions/${a.id}`}
                          className="text-xs text-[var(--dash-primary)] font-medium"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
