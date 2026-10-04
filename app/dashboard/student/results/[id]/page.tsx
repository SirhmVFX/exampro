"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Printer } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { db } from "@/lib/firebase";
import { COL, getAssessment, upsertLearningGap } from "@/lib/db";
import type { Assessment, Attempt, Question } from "@/lib/types";
import { HtmlContent } from "@/app/components/ui/html-content";
import { useAuth } from "@/lib/auth-context";

// ── Practice Similar button ────────────────────────────────────────────────

function PracticeSimilarBtn({
  question,
  assessmentSubject,
}: {
  question: Question;
  assessmentSubject: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/create-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: {
            ...question,
            subject: question.subject || assessmentSubject,
          },
          count: 3,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      // Store in sessionStorage — practice page picks these up
      const existing = JSON.parse(sessionStorage.getItem("practiceQuestions") ?? "[]");
      sessionStorage.setItem("practiceQuestions", JSON.stringify([...existing, ...data.questions]));
      sessionStorage.setItem("practiceMeta", JSON.stringify({
        subject: question.subject || assessmentSubject,
        topic: question.topic || assessmentSubject,
        difficulty: "medium",
      }));
      window.location.href = "/dashboard/student/practice";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        title="Generate 3 similar practice questions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <><div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="w-3 h-3" /> Practice similar</>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Question result card ───────────────────────────────────────────────────

function QuestionResultCard({
  q,
  i,
  r,
  assessmentSubject,
}: {
  q: Question;
  i: number;
  r: Attempt["perQuestion"][0] | undefined;
  assessmentSubject: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCorrect = r?.correct === true;
  const isPending = r?.correct === null;
  const pts = r?.pointsAwarded ?? 0;

  const borderColor = isPending
    ? "border-amber-200"
    : isCorrect
      ? "border-emerald-200"
      : "border-red-200";
  const headerBg = isPending
    ? "bg-amber-50"
    : isCorrect
      ? "bg-emerald-50"
      : "bg-red-50";

  return (
    <div className={`border ${borderColor} rounded-xl overflow-hidden`}>
      {/* Header */}
      <div className={`${headerBg} px-4 py-3 flex items-start justify-between gap-3`}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white ${isPending ? "bg-amber-500" : isCorrect ? "bg-emerald-500" : "bg-red-500"
            }`}>{i + 1}</div>
          <div className="min-w-0">
            <HtmlContent html={q.text} compact className="text-sm font-medium text-[var(--dash-text)] line-clamp-2" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPending ? (
            <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
          ) : isCorrect ? (
            <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />{pts}/{q.points}</Badge>
          ) : (
            <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" />{pts}/{q.points}</Badge>
          )}
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="px-4 py-4 bg-[var(--dash-surface)] space-y-3">
          {/* Image if any */}
          {(q as Question & { imageUrl?: string }).imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(q as Question & { imageUrl?: string }).imageUrl} alt="Question diagram"
              className="max-h-48 rounded-lg border border-[var(--dash-border)] object-contain" />
          )}

          {/* Student answer */}
          <div>
            <p className="text-xs font-semibold text-[var(--dash-text-muted)] mb-1">Your answer</p>
            <div className={`text-sm px-3 py-2 rounded-lg border ${isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
              }`}>
              {typeof r?.answer === "boolean" ? (
                r.answer ? "True" : "False"
              ) : q.type === "mcq" && typeof r?.answer === "number" ? (
                q.options?.[r.answer] ?? String(r.answer)
              ) : typeof r?.answer === "string" ? (
                <HtmlContent html={r.answer} compact />
              ) : (
                String(r?.answer ?? "Not answered")
              )}
              {isCorrect ? " ✓" : !isPending ? " ✗" : ""}
            </div>
          </div>

          {/* Correct answer (if wrong) */}
          {!isCorrect && !isPending && (
            <div>
              <p className="text-xs font-semibold text-[var(--dash-text-muted)] mb-1">Correct answer</p>
              <div className="text-sm px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold">
                {q.type === "mcq" && q.correctIndex !== undefined ? (
                  q.options?.[q.correctIndex]
                ) : q.type === "truefalse" ? (
                  q.correctBool ? "True" : "False"
                ) : q.type === "short" ? (
                  (q.acceptedAnswers ?? []).join(" / ")
                ) : (
                  "See explanation below"
                )}
                {" ✓"}
              </div>
            </div>
          )}

          {/* Explanation */}
          {q.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
              <HtmlContent html={q.explanation} compact className="text-xs text-blue-700" />
            </div>
          )}

          {/* Worked solution */}
          {(q as Question & { workedSolution?: string }).workedSolution && (
            <div className="bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-[var(--dash-text-muted)] mb-1">Worked solution</p>
              <p className="text-xs text-[var(--dash-text)] whitespace-pre-wrap leading-relaxed font-mono">
                {(q as Question & { workedSolution?: string }).workedSolution}
              </p>
            </div>
          )}

          {/* Teacher feedback */}
          {r?.teacherFeedback && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-purple-700 mb-1">Teacher feedback</p>
              <p className="text-sm text-purple-800">{r.teacherFeedback}</p>
            </div>
          )}

          {/* Practice Similar (only for wrong answers on auto-graded types) */}
          {!isCorrect && !isPending && ["mcq", "truefalse", "short"].includes(q.type) && (
            <PracticeSimilarBtn question={q} assessmentSubject={assessmentSubject} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function StudentResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, institution } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, COL.attempts, id));
      if (!snap.exists()) return;
      const att = snap.data() as Attempt;
      setAttempt(att);
      const a = await getAssessment(att.assessmentId);
      setAssessment(a);

      // Track learning gap
      if (a && institution && profile && att.status !== "in_progress") {
        void upsertLearningGap(
          institution.id,
          profile.uid,
          a.subject,
          a.title,
          att.percent
        );
      }
    })();
  }, [id, institution, profile]);

  if (!attempt || !assessment) {
    return (
      <DashboardShell role="student" navItems={studentNav} title="Result">
        <div className="h-32 bg-[var(--dash-surface)] rounded-xl border border-[var(--dash-border)] animate-pulse" />
      </DashboardShell>
    );
  }

  const hideAnswers = !assessment.showResultsImmediately && attempt.status !== "graded";
  const wrongCount = attempt.perQuestion.filter((r) => r.correct === false).length;
  const correctCount = attempt.perQuestion.filter((r) => r.correct === true).length;
  const pendingCount = attempt.perQuestion.filter((r) => r.correct === null).length;

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title={attempt.assessmentTitle}
      subtitle={`Attempt ${attempt.attemptNumber} · ${assessment.subject}`}
    >
      <div className="max-w-3xl space-y-4">
        {/* Score summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardBody className="text-center py-5">
              <p className={`text-4xl font-black ${attempt.passed ? "text-emerald-600" : "text-red-500"}`}>
                {Math.round(attempt.percent)}%
              </p>
              <p className="text-xs text-[var(--dash-text-faint)] mt-1 font-medium uppercase tracking-wide">Score</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-5">
              <p className="text-4xl font-black text-[var(--dash-text)]">
                {Math.round(attempt.score)}/{attempt.maxScore}
              </p>
              <p className="text-xs text-[var(--dash-text-faint)] mt-1 font-medium uppercase tracking-wide">Points</p>
            </CardBody>
          </Card>
          <Card className={attempt.passed ? "border-emerald-300" : "border-red-300"}>
            <CardBody className="text-center py-5">
              <p className={`text-2xl font-black ${attempt.passed ? "text-emerald-700" : "text-red-600"}`}>
                {attempt.passed ? "PASSED" : "FAILED"}
              </p>
              <p className="text-xs text-[var(--dash-text-faint)] mt-1">Pass mark {assessment.passPercent}%</p>
            </CardBody>
          </Card>
        </div>

        {/* Stats row */}
        {!hideAnswers && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <CheckCircle className="w-4 h-4" /> {correctCount} correct
            </div>
            {wrongCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                <XCircle className="w-4 h-4" /> {wrongCount} incorrect
              </div>
            )}
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <Clock className="w-4 h-4" /> {pendingCount} pending grade
              </div>
            )}
            {attempt.attachmentUrl && (
              <a href={attempt.attachmentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100">
                📎 View my attached file
              </a>
            )}
          </div>
        )}

        {/* Status banner for pending */}
        {attempt.needsManualGrading && attempt.status !== "graded" && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <p>Some questions need manual grading by your teacher. Your score will update when they finish.</p>
          </div>
        )}

        {/* Practice Similar prompt */}
        {!hideAnswers && wrongCount > 0 && (
          <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-800">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-purple-500" />
            <div>
              <p className="font-semibold">Got {wrongCount} question{wrongCount !== 1 ? "s" : ""} wrong?</p>
              <p className="text-xs text-purple-600 mt-0.5">Click <strong>Practice similar</strong> on any wrong answer below to generate AI practice questions on that topic.</p>
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        {hideAnswers ? (
          <p className="text-sm text-[var(--dash-text-muted)] text-center py-8">
            Your teacher has hidden per-question results. Your overall score is shown above.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--dash-text)]">Question breakdown</h2>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition-colors">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
            {assessment.questions.map((q, i) => {
              const r = attempt.perQuestion.find((x) => x.questionId === q.id);
              return (
                <QuestionResultCard
                  key={q.id}
                  q={q}
                  i={i}
                  r={r}
                  assessmentSubject={assessment.subject}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
