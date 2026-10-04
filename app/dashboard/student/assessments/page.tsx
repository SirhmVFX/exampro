"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { EmptyState } from "@/app/components/ui/empty";
import { useAuth } from "@/lib/auth-context";
import {
  listAssessmentsForLearner,
  listAttemptsByStudent,
  listMaterialProgress,
} from "@/lib/db";
import type { Assessment, Attempt, MaterialProgress } from "@/lib/types";
import { HtmlContent } from "@/app/components/ui/html-content";
import {
  canTakeAssessment,
  completedMaterialIds,
  formatDuration,
  KIND_LABEL,
} from "@/lib/utils";

export default function StudentAssessmentsPage() {
  const { profile, institution } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [progress, setProgress] = useState<MaterialProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !institution) {
      setLoading(false);
      return;
    }
    (async () => {
      const [as, atts, prog] = await Promise.all([
        listAssessmentsForLearner(institution.id, profile),
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialProgress(institution.id, profile.uid),
      ]);
      setItems(as);
      setAttempts(atts);
      setProgress(prog);
      setLoading(false);
    })();
  }, [profile, institution]);

  const completed = completedMaterialIds(progress);

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title="Assessments"
      subtitle="Quizzes, tests, exams and assignments assigned to you"
    >
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="Nothing assigned yet"
              description="When a teacher publishes work for your class, it will appear here."
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((a) => {
                const mine = attempts.filter((x) => x.assessmentId === a.id);
                const gate = canTakeAssessment(a, mine, completed, profile?.uid);
                const last = mine.find((x) => x.status !== "in_progress");
                const inProgress = mine.find((x) => x.status === "in_progress");
                return (
                  <div key={a.id} className="px-6 py-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{KIND_LABEL[a.kind]}</Badge>
                        <span className="text-xs text-[var(--dash-text-faint)]">{a.subject}</span>
                      </div>
                      <p className="font-medium text-[var(--dash-text)]">{a.title}</p>
                      {a.description && (
                        <HtmlContent html={a.description} compact className="mt-0.5" />
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.questions.length} questions · {formatDuration(a.durationMins)} · pass {a.passPercent}%
                        {last ? ` · last score ${Math.round(last.percent)}%` : ""}
                      </p>
                      {!gate.ok && (
                        <p className="text-xs text-amber-700 mt-1">{gate.reason}</p>
                      )}
                    </div>
                    {inProgress ? (
                      <Link href={`/dashboard/student/assessments/${a.id}/take`}>
                        <Button size="sm">Resume</Button>
                      </Link>
                    ) : gate.ok ? (
                      <Link href={`/dashboard/student/assessments/${a.id}/take`}>
                        <Button size="sm">{last ? "Retake" : "Start"}</Button>
                      </Link>
                    ) : last ? (
                      <Link href={`/dashboard/student/results/${last.id}`}>
                        <Button size="sm" variant="outline">
                          View result
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        Locked
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
