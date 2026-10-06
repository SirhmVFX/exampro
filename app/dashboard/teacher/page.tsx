"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Library,
  BookOpen,
  ClipboardCheck,
  Plus,
  Inbox,
} from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { StatCard } from "@/app/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  listAssessmentsByTeacher,
  listAttemptsByTeacher,
  listMaterialsByTeacher,
  listQuestions,
} from "@/lib/db";
import type { Attempt } from "@/lib/types";
import { formatDateTime, passRate } from "@/lib/utils";

export default function TeacherOverviewPage() {
  const { profile, institution } = useAuth();
  const [counts, setCounts] = useState({
    questions: 0,
    assessments: 0,
    materials: 0,
    pending: 0,
  });
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) return;
    (async () => {
      const [qs, as, mats, atts] = await Promise.all([
        listQuestions(institution.id, profile.uid),
        listAssessmentsByTeacher(institution.id, profile.uid),
        listMaterialsByTeacher(institution.id, profile.uid),
        listAttemptsByTeacher(institution.id, profile.uid),
      ]);
      setCounts({
        questions: qs.length,
        assessments: as.length,
        materials: mats.length,
        pending: atts.filter((a) => a.needsManualGrading && a.status !== "graded").length,
      });
      setRecent(atts.slice(0, 8));
      setLoading(false);
    })();
  }, [profile, institution]);

  const submitted = recent.filter((a) => a.status !== "in_progress");
  const pass = passRate(submitted);

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Overview"
      subtitle={`Welcome back${profile ? `, ${profile.name.split(" ")[0]}` : ""}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Questions"
            value={loading ? "—" : counts.questions}
            icon={<Library className="w-5 h-5" />}
            color="indigo"
          />
          <StatCard
            label="Assessments"
            value={loading ? "—" : counts.assessments}
            icon={<FileText className="w-5 h-5" />}
            color="cyan"
          />
          <StatCard
            label="Materials"
            value={loading ? "—" : counts.materials}
            icon={<BookOpen className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Needs grading"
            value={loading ? "—" : counts.pending}
            icon={<ClipboardCheck className="w-5 h-5" />}
            color="amber"
            trendLabel={pass === null ? "No submissions yet" : `${pass}% pass rate`}
            trend={pass === null ? "neutral" : pass >= 50 ? "up" : "down"}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/teacher/questions">
            <Button>
              <Plus className="w-4 h-4" /> Add questions
            </Button>
          </Link>
          <Link href="/dashboard/teacher/assessments/new">
            <Button variant="outline">Create assessment</Button>
          </Link>
          <Link href="/dashboard/teacher/materials">
            <Button variant="outline">Upload material</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent submissions</h2>
          </CardHeader>
          <CardBody className="p-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <Inbox className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-[var(--dash-text-muted)]">No submissions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.studentName}</p>
                      <p className="text-xs text-gray-500 truncate">{a.assessmentTitle}</p>
                    </div>
                    <span className="text-sm font-semibold">{Math.round(a.percent)}%</span>
                    {a.needsManualGrading && a.status !== "graded" ? (
                      <Badge variant="warning">Needs grading</Badge>
                    ) : a.status === "in_progress" ? (
                      <Badge variant="info">In progress</Badge>
                    ) : (
                      <Badge variant={a.passed ? "success" : "danger"}>
                        {a.passed ? "Pass" : "Fail"}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {formatDateTime(a.submittedAt ?? a.startedAt)}
                    </span>
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
