"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, BookOpen, Award, TrendingUp } from "lucide-react";
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
} from "@/lib/db";
import type { Assessment, Attempt } from "@/lib/types";
import { learnerClassNames } from "@/lib/learners";
import { averagePercent, KIND_LABEL } from "@/lib/utils";

export default function StudentOverviewPage() {
  const { profile, institution } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [materialCount, setMaterialCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) {
      setLoading(false);
      return;
    }
    (async () => {
      const [as, atts, mats, prog] = await Promise.all([
        listAssessmentsForLearner(institution.id, profile),
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialsForLearner(institution.id, profile),
        listMaterialProgress(institution.id, profile.uid),
      ]);
      setAssessments(as);
      setAttempts(atts);
      setMaterialCount(mats.length);
      setCompletedCount(prog.filter((p) => p.completed).length);
      setLoading(false);
    })();
  }, [profile, institution]);

  const done = attempts.filter((a) => a.status !== "in_progress");
  const avg = averagePercent(done);
  const upcoming = assessments.slice(0, 5);

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
            color="amber"
          />
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
                      <p className="text-xs text-gray-500">
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
