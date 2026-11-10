"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, CalendarCheck } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import {
  listAttemptsByStudent,
  listMaterialProgress,
  listMaterialsForLearner,
  listEnrollments,
  listAttendanceDays,
  summarizeAttendance,
  listPaths,
} from "@/lib/db";
import type { Attempt, Enrollment, LearningPath } from "@/lib/types";
import { averagePercent, passRate } from "@/lib/utils";
import { learnerClassNames } from "@/lib/learners";

export default function StudentProgressPage() {
  const { profile, institution } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [matTotal, setMatTotal] = useState(0);
  const [matDone, setMatDone] = useState(0);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [attendance, setAttendance] = useState({
    total: 0,
    last30: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) return;
    (async () => {
      const [atts, mats, prog, ens, attDays, ps] = await Promise.all([
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialsForLearner(institution.id, profile),
        listMaterialProgress(institution.id, profile.uid),
        listEnrollments(institution.id, profile.uid),
        listAttendanceDays(institution.id, profile.uid),
        listPaths(institution.id),
      ]);
      setAttempts(atts.filter((a) => a.status !== "in_progress"));
      setMatTotal(mats.length);
      setMatDone(prog.filter((p) => p.completed).length);
      setEnrollments(ens);
      setAttendance(summarizeAttendance(attDays));
      setPaths(ps);
      setLoading(false);
    })();
  }, [profile, institution]);

  const bySubject = useMemo(() => {
    const map: Record<string, Attempt[]> = {};
    for (const a of attempts) (map[a.subject] ??= []).push(a);
    return Object.entries(map).map(([label, list]) => ({
      label,
      avg: averagePercent(list) ?? 0,
      pass: passRate(list) ?? 0,
      n: list.length,
    }));
  }, [attempts]);

  const avg = averagePercent(attempts);
  const pass = passRate(attempts);
  const matPct = matTotal > 0 ? Math.round((matDone / matTotal) * 100) : 0;

  // Learning path progress: for each path, count completed items
  const pathProgress = useMemo(() => {
    const completedMaterialIdSet = new Set<string>();
    const passedAssessmentIds = new Set<string>();
    // We don't have materialProgress here but we'll derive from attempts for assessments
    for (const att of attempts) {
      if (att.passed) passedAssessmentIds.add(att.assessmentId);
    }
    return paths.map((p) => {
      const done = p.items.filter((item) => {
        if (item.type === "assessment") return passedAssessmentIds.has(item.refId);
        return completedMaterialIdSet.has(item.refId); // will be 0 until material progress is passed
      }).length;
      return { path: p, done, total: p.items.length };
    }).filter((x) => x.total > 0);
  }, [paths, attempts]);

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Progress"
      subtitle={`Track how you're doing in ${learnerClassNames(profile).join(", ") || "your groups"}`}
    >
      {loading ? (
        <div className="h-32 bg-white rounded-xl border animate-pulse" />
      ) : (
        <div className="space-y-6">
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Your groups</h2>
              </CardHeader>
              <CardBody className="p-0">
                {enrollments.map((e) => (
                  <div
                    key={e.id}
                    className="px-6 py-3 flex justify-between text-sm border-t border-gray-50"
                  >
                    <span>{e.cohortName}</span>
                    <span className="text-gray-500 capitalize">{e.status}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              label="Average score"
              value={avg === null ? "—" : `${avg}%`}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Pass rate"
              value={pass === null ? "—" : `${pass}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Materials completed"
              value={`${matPct}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="cyan"
              trendLabel={`${matDone} of ${matTotal}`}
              trend="neutral"
            />
            <StatCard
              label="Days attended"
              value={String(attendance.total)}
              icon={<CalendarCheck className="w-5 h-5" />}
              color="amber"
              trendLabel={`${attendance.last30} in the last 30 days`}
              trend="neutral"
            />
          </div>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Attendance</h2>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
              <p>
                <span className="text-[var(--dash-text-muted)]">Present </span>
                <strong>{attendance.total}</strong> day
                {attendance.total === 1 ? "" : "s"} in total
              </p>
              <p>
                <span className="text-[var(--dash-text-muted)]">
                  Last 30 days{" "}
                </span>
                <strong>{attendance.last30}</strong>
              </p>
              <p>
                <span className="text-[var(--dash-text-muted)]">
                  Current streak{" "}
                </span>
                <strong>{attendance.currentStreak}</strong> day
                {attendance.currentStreak === 1 ? "" : "s"}
              </p>
              <p className="w-full text-xs text-[var(--dash-text-muted)]">
                You&apos;re marked present automatically on every day you log
                in.
              </p>
            </CardBody>
          </Card>
          {pathProgress.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Learning path progress</h2>
              </CardHeader>
              <CardBody className="space-y-5">
                {pathProgress.map(({ path, done, total }) => {
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={path.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{path.title}</span>
                        <span className="text-[var(--dash-text-muted)]">{done} / {total} steps · {pct}%</span>
                      </div>
                      <div className="h-2.5 bg-[var(--dash-surface-alt)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--dash-primary)] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <ol className="mt-2 space-y-1">
                        {path.items.map((item, i) => {
                          const completed =
                            item.type === "assessment"
                              ? attempts.some((a) => a.assessmentId === item.refId && a.passed)
                              : false;
                          return (
                            <li key={item.id} className="flex items-center gap-2 text-xs text-[var(--dash-text-muted)]">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"}`}>
                                {completed ? "✓" : i + 1}
                              </span>
                              {item.title}
                              {item.required && <span className="text-[10px] border border-[var(--dash-border)] rounded px-1">required</span>}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          )}
          {attempts.length === 0 ? (
            <Card>
              <EmptyState
                icon={<TrendingUp className="w-6 h-6" />}
                title="No progress yet"
                description="Complete materials and assessments to see charts here."
              />
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">By subject</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {bySubject.map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{r.label}</span>
                      <span className="text-gray-500">
                        avg {r.avg}% · pass {r.pass}% · {r.n} attempts
                      </span>
                    </div>
                    <div className="h-2.5 bg-[var(--dash-surface-alt)]">
                      <div
                        className="h-full bg-[var(--dash-primary-soft)]"
                        style={{ width: `${r.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
