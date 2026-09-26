"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
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
} from "@/lib/db";
import type { Attempt, Enrollment } from "@/lib/types";
import { averagePercent, passRate } from "@/lib/utils";
import { learnerClassNames } from "@/lib/learners";

export default function StudentProgressPage() {
  const { profile, institution } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [matTotal, setMatTotal] = useState(0);
  const [matDone, setMatDone] = useState(0);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) return;
    (async () => {
      const [atts, mats, prog, ens] = await Promise.all([
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialsForLearner(institution.id, profile),
        listMaterialProgress(institution.id, profile.uid),
        listEnrollments(institution.id, profile.uid),
      ]);
      setAttempts(atts.filter((a) => a.status !== "in_progress"));
      setMatTotal(mats.length);
      setMatDone(prog.filter((p) => p.completed).length);
      setEnrollments(ens);
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
          <div className="grid md:grid-cols-3 gap-6">
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
          </div>
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
                    <div className="h-2.5 bg-gray-100">
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
