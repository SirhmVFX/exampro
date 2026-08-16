"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { db } from "@/lib/firebase";
import { COL, getAssessment } from "@/lib/db";
import type { Assessment, Attempt } from "@/lib/types";
import { HtmlContent } from "@/app/components/ui/html-content";

export default function StudentResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, COL.attempts, id));
      if (!snap.exists()) return;
      const att = snap.data() as Attempt;
      setAttempt(att);
      setAssessment(await getAssessment(att.assessmentId));
    })();
  }, [id]);

  if (!attempt || !assessment) {
    return (
      <DashboardShell role="student" navItems={studentNav} title="Result">
        <div className="h-32 bg-white rounded-xl border animate-pulse" />
      </DashboardShell>
    );
  }

  const hideAnswers = !assessment.showResultsImmediately && attempt.status !== "graded";

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title={attempt.assessmentTitle}
      subtitle={`Attempt ${attempt.attemptNumber}`}
    >
      <div className="max-w-3xl space-y-4">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-3xl font-bold">
                {Math.round(attempt.percent)}%
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(attempt.score)} / {attempt.maxScore} points
              </p>
            </div>
            {attempt.needsManualGrading && attempt.status !== "graded" ? (
              <Badge variant="warning">Awaiting teacher grade</Badge>
            ) : (
              <Badge variant={attempt.passed ? "success" : "danger"}>
                {attempt.passed ? "Passed" : "Failed"} (pass mark {assessment.passPercent}%)
              </Badge>
            )}
          </CardBody>
        </Card>
        {hideAnswers ? (
          <p className="text-sm text-gray-500">
            Your teacher hid per-question results. You&apos;ll see the overall score above.
          </p>
        ) : (
          assessment.questions.map((q, i) => {
            const r = attempt.perQuestion.find((x) => x.questionId === q.id);
            return (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium">
                      {i + 1}. <HtmlContent html={q.text} className="inline" />
                    </div>
                    {r?.correct === null ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : (
                      <Badge variant={r?.correct ? "success" : "danger"}>
                        {r?.pointsAwarded ?? 0}/{q.points}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="space-y-2 text-sm">
                  <div className="text-gray-500">
                    Your answer:{" "}
                    {typeof r?.answer === "boolean" ? (
                      <span className="text-gray-900">{r.answer ? "True" : "False"}</span>
                    ) : q.type === "mcq" && typeof r?.answer === "number" ? (
                      <span className="text-gray-900">
                        {q.options?.[r.answer] ?? String(r.answer)}
                      </span>
                    ) : typeof r?.answer === "string" ? (
                      <HtmlContent html={r.answer} className="text-gray-900 mt-1" />
                    ) : (
                      <span className="text-gray-900 whitespace-pre-wrap">
                        {String(r?.answer ?? "—")}
                      </span>
                    )}
                  </div>
                  {q.explanation && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-3">
                      <HtmlContent html={q.explanation} compact />
                    </div>
                  )}
                  {r?.teacherFeedback && (
                    <p className="text-xs text-[var(--dash-primary)]">Teacher: {r.teacherFeedback}</p>
                  )}
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
