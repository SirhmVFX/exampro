"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, BookOpen, Award, TrendingUp, Video, Flame, Medal } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { StatCard } from "@/app/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  listAssessmentsForLearner,
  listAttemptsByStudent,
  listMaterialsForLearner,
  listMaterialProgress,
  listSessionsForLearner,
  listAttendanceDays,
  listCertificates,
} from "@/lib/db";
import type { Assessment, Attempt, LiveSession, Certificate } from "@/lib/types";
import { learnerClassNames } from "@/lib/learners";
import { subjectMarks } from "@/lib/gradebook";
import { averagePercent, KIND_LABEL, formatDateTime } from "@/lib/utils";

export default function StudentOverviewPage() {
  const { profile, institution } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [materialCount, setMaterialCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [attendance, setAttendance] = useState<string[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) {
      setLoading(false);
      return;
    }
    (async () => {
      const [as, atts, mats, prog, sess, att_days, cc] = await Promise.all([
        listAssessmentsForLearner(institution.id, profile),
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialsForLearner(institution.id, profile),
        listMaterialProgress(institution.id, profile.uid),
        listSessionsForLearner(institution.id, profile),
        listAttendanceDays(institution.id, profile.uid),
        listCertificates(institution.id, profile.uid),
      ]);
      setAssessments(as);
      setAttempts(atts);
      setMaterialCount(mats.length);
      setCompletedCount(prog.filter((p) => p.completed).length);
      const now = Date.now();
      setSessions(sess.filter((s) => s.status === "scheduled" && s.startsAt >= now).slice(0, 3));
      setAttendance(att_days);
      setCerts(cc.slice(0, 3));
      setLoading(false);
    })();
  }, [profile, institution]);

  const done = attempts.filter((a) => a.status !== "in_progress");
  const avg = averagePercent(done);
  const upcoming = assessments.slice(0, 5);
  const marks = subjectMarks(done).slice(0, 5);
  const streak = attendanceStreak(attendance);

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Overview"
      subtitle={
        profile?.className || learnerClassNames(profile).length
          ? `${institution?.name ?? ""} · ${learnerClassNames(profile).join(", ")}`
          : institution?.name
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Available assessments"
            value={loading ? "—" : assessments.length}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            label="Attendance streak"
            value={streak ? `${streak} day${streak === 1 ? "" : "s"}` : "—"}
            icon={<Flame className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Materials completed"
            value={loading ? "—" : `${completedCount}/${materialCount}`}
            icon={<BookOpen className="w-5 h-5" />}
            color="cyan"
          />
          <StatCard
            label="Average score"
            value={avg === null ? "—" : `${avg}%`}
            icon={<Award className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Attempts"
            value={loading ? "—" : done.length}
            icon={<TrendingUp className="w-5 h-5" />}
            color="indigo"
          />
        </div>

        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Upcoming live sessions</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-[var(--dash-border)]">
                {sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-[var(--dash-text-muted)]">
                        {formatDateTime(s.startsAt)} · with {s.hostName}
                      </p>
                    </div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Join</Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Subject breakdown</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {marks.length === 0 ? (
                <p className="text-sm text-[var(--dash-text-faint)]">
                  Your subject scores appear once you complete assessments.
                </p>
              ) : (
                marks.map((m) => (
                  <div key={`${m.subject}-${m.className}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--dash-text-muted)]">{m.subject}</span>
                      <span className="font-semibold">{m.percent}%</span>
                    </div>
                    <div className="h-2 rounded bg-[var(--dash-surface-alt)]">
                      <div
                        className="h-full rounded bg-[var(--dash-primary)]"
                        style={{ width: `${m.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your certificates</h2>
                <Link href="/dashboard/student/certificates" className="text-sm text-[var(--dash-primary)]">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {certs.length === 0 ? (
                <p className="px-6 py-8 text-sm text-[var(--dash-text-faint)] text-center">
                  No certificates yet — keep up the great work!
                </p>
              ) : (
                <div className="divide-y divide-[var(--dash-border)]">
                  {certs.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                      <Medal className="w-5 h-5 text-[var(--dash-primary)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.title}</p>
                        <p className="text-xs text-[var(--dash-text-muted)]">{c.verifyCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold">Your assessments</h2>
            <Link href="/dashboard/student/assessments" className="text-sm text-[var(--dash-primary)]">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {upcoming.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-400 text-center">
                No published assessments for your {institution?.classLabel?.toLowerCase() ?? "class"} yet.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-[var(--dash-text-muted)]">
                        {KIND_LABEL[a.kind]} · {a.subject} · {a.questions.length} questions
                      </p>
                    </div>
                    <Badge variant="info">{KIND_LABEL[a.kind]}</Badge>
                    <Link href={`/dashboard/student/assessments/${a.id}/take`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}

/** Consecutive-day attendance streak ending today or yesterday. */
function attendanceStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
