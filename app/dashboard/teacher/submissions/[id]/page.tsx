"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { COL, getAssessment, updateAttempt } from "@/lib/db";
import type { Assessment, Attempt } from "@/lib/types";
import { HtmlContent } from "@/app/components/ui/html-content";
import { inputClass } from "@/lib/utils";

export default function GradeSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [awards, setAwards] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, COL.attempts, id));
      if (!snap.exists()) return;
      const att = snap.data() as Attempt;
      setAttempt(att);
      const a = await getAssessment(att.assessmentId);
      setAssessment(a);
      const initA: Record<string, number> = {};
      const initF: Record<string, string> = {};
      for (const r of att.perQuestion) {
        initA[r.questionId] = r.pointsAwarded;
        initF[r.questionId] = r.teacherFeedback ?? "";
      }
      setAwards(initA);
      setFeedback(initF);
    })();
  }, [id]);

  if (!attempt || !assessment) {
    return (
      <DashboardShell role="teacher" navItems={teacherNav} title="Submission">
        <div className="h-32 bg-white rounded-xl border animate-pulse" />
      </DashboardShell>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const perQuestion = attempt.perQuestion.map((r) => {
        const pts = Number(awards[r.questionId] ?? r.pointsAwarded);
        return {
          ...r,
          pointsAwarded: pts,
          correct: pts >= r.maxPoints,
          teacherFeedback: feedback[r.questionId] || undefined,
        };
      });
      const score = perQuestion.reduce((s, r) => s + r.pointsAwarded, 0);
      const percent = attempt.maxScore > 0 ? Math.round((score / attempt.maxScore) * 100) : 0;
      await updateAttempt(attempt.id, {
        perQuestion,
        score,
        percent,
        passed: percent >= assessment.passPercent,
        needsManualGrading: false,
        status: "graded",
      });
      router.push("/dashboard/teacher/submissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title={attempt.studentName}
      subtitle={`${attempt.assessmentTitle} · attempt ${attempt.attemptNumber}`}
    >
      <div className="max-w-3xl space-y-4">
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current score</p>
              <p className="text-2xl font-bold">
                {Math.round(attempt.score)} / {attempt.maxScore}
              </p>
            </div>
            <Badge variant={attempt.passed ? "success" : "danger"}>
              {attempt.percent}%
            </Badge>
          </CardBody>
        </Card>
        {assessment.questions.map((q, i) => {
          const r = attempt.perQuestion.find((x) => x.questionId === q.id);
          const answer = r?.answer;
          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="text-sm font-semibold">
                  {i + 1}. <HtmlContent html={q.text} className="inline" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {q.type} · {q.points} pts
                  {r?.correct === null ? " · needs manual grade" : ""}
                </p>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="bg-gray-50 p-3 text-sm">
                  {typeof answer === "boolean" ? (
                    answer ? "True" : "False"
                  ) : typeof answer === "string" ? (
                    <HtmlContent html={answer} />
                  ) : typeof answer === "object" && answer ? (
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {JSON.stringify(answer, null, 2)}
                    </pre>
                  ) : (
                    String(answer ?? "—")
                  )}
                </div>
                {attempt.events && attempt.events.length > 0 && i === 0 && (
                  <p className="text-xs text-gray-400">
                    Integrity:{" "}
                    {attempt.events
                      .filter((e) => e.type === "tab_blur" || e.type === "leave_attempt")
                      .length}{" "}
                    tab/leave events
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Points awarded (max {q.points})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={q.points}
                      value={awards[q.id] ?? 0}
                      onChange={(e) =>
                        setAwards({ ...awards, [q.id]: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Feedback</label>
                    <input
                      value={feedback[q.id] ?? ""}
                      onChange={(e) =>
                        setFeedback({ ...feedback, [q.id]: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
        {profile && (
          <Button loading={saving} onClick={() => void save()}>
            Save grades
          </Button>
        )}
      </div>
    </DashboardShell>
  );
}
