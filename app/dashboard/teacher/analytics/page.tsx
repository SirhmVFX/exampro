"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAssessmentsByTeacher, listAttemptsByTeacher } from "@/lib/db";
import type { Assessment, Attempt } from "@/lib/types";
import { averagePercent, passRate } from "@/lib/utils";

export default function TeacherAnalyticsPage() {
  const { profile, institution } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution || !profile) return;
    (async () => {
      const [a, t] = await Promise.all([
        listAssessmentsByTeacher(institution.id, profile.uid),
        listAttemptsByTeacher(institution.id, profile.uid),
      ]);
      setAssessments(a);
      setAttempts(t.filter((x) => x.status !== "in_progress"));
      setLoading(false);
    })();
  }, [institution, profile]);

  const byAssessment = useMemo(() => {
    return assessments.map((a) => {
      const list = attempts.filter((x) => x.assessmentId === a.id);
      return {
        title: a.title,
        n: list.length,
        avg: averagePercent(list),
        pass: passRate(list),
      };
    });
  }, [assessments, attempts]);

  const bySubject = useMemo(() => {
    const map: Record<string, Attempt[]> = {};
    for (const a of attempts) (map[a.subject] ??= []).push(a);
    return Object.entries(map).map(([label, list]) => ({
      label,
      value: passRate(list) ?? 0,
    }));
  }, [attempts]);

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Analytics"
      subtitle="How your students are doing across your assessments"
    >
      {loading ? (
        <div className="h-32 bg-white rounded-xl border animate-pulse" />
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              label="Assessments"
              value={assessments.length}
              icon={<BarChart3 className="w-5 h-5" />}
            />
            <StatCard
              label="Submissions"
              value={attempts.length}
              icon={<BarChart3 className="w-5 h-5" />}
              color="cyan"
            />
            <StatCard
              label="Pass rate"
              value={passRate(attempts) === null ? "—" : `${passRate(attempts)}%`}
              icon={<BarChart3 className="w-5 h-5" />}
              color="emerald"
            />
          </div>
          {attempts.length === 0 ? (
            <Card>
              <EmptyState
                icon={<BarChart3 className="w-6 h-6" />}
                title="No data yet"
                description="Analytics appear after students submit work."
              />
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">By subject</h2>
                </CardHeader>
                <CardBody className="space-y-3">
                  {bySubject.map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{r.label}</span>
                        <span className="font-semibold">{r.value}%</span>
                      </div>
                      <div className="h-2 bg-[var(--dash-surface-alt)]">
                        <div
                          className="h-full bg-[var(--dash-primary-soft)]"
                          style={{ width: `${r.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h2 className="font-semibold">By assessment</h2>
                </CardHeader>
                <CardBody className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-3">Assessment</th>
                        <th className="px-6 py-3">N</th>
                        <th className="px-6 py-3">Avg</th>
                        <th className="px-6 py-3">Pass</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {byAssessment.map((r) => (
                        <tr key={r.title}>
                          <td className="px-6 py-3">{r.title}</td>
                          <td className="px-6 py-3">{r.n}</td>
                          <td className="px-6 py-3">
                            {r.avg === null ? "—" : `${r.avg}%`}
                          </td>
                          <td className="px-6 py-3">
                            {r.pass === null ? "—" : `${r.pass}%`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
