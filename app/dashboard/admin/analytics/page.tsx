"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, GraduationCap, Users, FileText, TrendingUp } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { adminNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { StatCard } from "@/app/components/ui/stat-card";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import { listAllAssessments, listAllAttempts, listUsers } from "@/lib/db";
import type { Assessment, Attempt, UserProfile } from "@/lib/types";
import { averagePercent, passRate } from "@/lib/utils";

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--dash-text-muted)]">
        <span className="truncate pr-2">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-[var(--dash-primary-soft)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { institution } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution) return;
    (async () => {
      const [users, a, att] = await Promise.all([
        listUsers(institution.id),
        listAllAssessments(institution.id),
        listAllAttempts(institution.id),
      ]);
      setStudents(users.filter((u) => u.role === "student"));
      setTeachers(users.filter((u) => u.role === "teacher"));
      setAssessments(a);
      setAttempts(att);
      setLoading(false);
    })();
  }, [institution]);

  const done = attempts.filter((a) => a.status !== "in_progress");
  const avg = averagePercent(done);
  const pass = passRate(done);

  const byClass = useMemo(() => {
    const map: Record<string, Attempt[]> = {};
    for (const a of done) {
      (map[a.className] ??= []).push(a);
    }
    return Object.entries(map)
      .map(([label, list]) => ({ label, value: passRate(list) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [done]);

  const bySubject = useMemo(() => {
    const map: Record<string, Attempt[]> = {};
    for (const a of done) {
      (map[a.subject] ??= []).push(a);
    }
    return Object.entries(map)
      .map(([label, list]) => ({ label, value: passRate(list) ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [done]);

  const byTeacher = useMemo(() => {
    const map: Record<string, { name: string; list: Attempt[] }> = {};
    for (const a of done) {
      const key = a.teacherId;
      if (!map[key]) {
        const t = teachers.find((x) => x.uid === key);
        map[key] = { name: t?.name ?? a.teacherId, list: [] };
      }
      map[key].list.push(a);
    }
    return Object.values(map)
      .map((x) => ({
        name: x.name,
        attempts: x.list.length,
        pass: passRate(x.list) ?? 0,
        avg: averagePercent(x.list) ?? 0,
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }, [done, teachers]);

  const maxBar = 100;

  return (
    <DashboardShell
      role="admin"
      navItems={adminNav}
      title="Analytics"
      subtitle="How students and teachers are performing across the institution"
    >
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Students"
              value={students.length}
              icon={<GraduationCap className="w-5 h-5" />}
              color="indigo"
            />
            <StatCard
              label="Teachers"
              value={teachers.length}
              icon={<Users className="w-5 h-5" />}
              color="cyan"
            />
            <StatCard
              label="Assessments"
              value={assessments.length}
              icon={<FileText className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Institution pass rate"
              value={pass === null ? "—" : `${pass}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="amber"
              trendLabel={avg === null ? "No submissions yet" : `Avg score ${avg}%`}
              trend={pass === null ? "neutral" : pass >= 50 ? "up" : "down"}
            />
          </div>

          {done.length === 0 ? (
            <Card>
              <EmptyState
                icon={<BarChart3 className="w-6 h-6" />}
                title="Not enough data yet"
                description="Analytics appear once students start submitting assessments."
              />
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Pass rate by {institution?.classLabel ?? "class"}</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {byClass.length === 0 ? (
                    <p className="text-sm text-[var(--dash-text-faint)]">No data</p>
                  ) : (
                    byClass.map((r) => (
                      <BarRow key={r.label} label={r.label} value={r.value} max={maxBar} />
                    ))
                  )}
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Pass rate by subject</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  {bySubject.map((r) => (
                    <BarRow key={r.label} label={r.label} value={r.value} max={maxBar} />
                  ))}
                </CardBody>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <h2 className="text-lg font-semibold">Teacher performance</h2>
                </CardHeader>
                <CardBody className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-3">Teacher</th>
                        <th className="px-6 py-3">Submissions</th>
                        <th className="px-6 py-3">Avg score</th>
                        <th className="px-6 py-3">Pass rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {byTeacher.map((t) => (
                        <tr key={t.name}>
                          <td className="px-6 py-3 font-medium">{t.name}</td>
                          <td className="px-6 py-3">{t.attempts}</td>
                          <td className="px-6 py-3">{t.avg}%</td>
                          <td className="px-6 py-3">{t.pass}%</td>
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
