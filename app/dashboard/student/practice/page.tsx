"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ArrowRight, Send, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getLearningGaps, upsertLearningGap } from "@/lib/db";
import type { Question } from "@/lib/types";

interface PracticeMeta {
  subject: string;
  topic: string;
  difficulty: string;
}

type PageState = "loading" | "gaps" | "running" | "results";

// ── Practice runner ──────────────────────────────────────────────────────────

function PracticeRunner({
  questions,
  meta,
  onDone,
}: {
  questions: Question[];
  meta: PracticeMeta;
  onDone: (answers: Record<string, unknown>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const q = questions[current];

  const handleSubmit = async () => {
    setSubmitting(true);
    onDone(answers);
  };

  return (
    <div className="border border-[var(--dash-border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-purple-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Practice Session
          </h2>
          <p className="text-white/70 text-sm">{meta.subject} · {meta.topic}</p>
        </div>
        <span className="bg-white/20 rounded-full px-3 py-1 text-sm">
          {Object.keys(answers).length}/{questions.length} answered
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-purple-600 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="p-6 bg-[var(--dash-surface)]">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-purple-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
            {current + 1}
          </span>
          <span className="text-xs text-[var(--dash-text-faint)] font-medium uppercase tracking-wide">
            {q.type} · {q.points} pt{q.points !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="text-[var(--dash-text)] font-medium text-base mb-4 leading-relaxed">{q.text}</p>

        {q.type === "mcq" && q.options && (
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <label key={i} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                answers[q.id] === i ? "border-purple-600 bg-purple-50" : "border-[var(--dash-border)] hover:border-purple-300"
              }`}>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  answers[q.id] === i ? "border-purple-600 bg-purple-600" : "border-gray-300"
                }`}>
                  {answers[q.id] === i && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <input type="radio" name={q.id} className="sr-only" checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
                <span className="text-sm text-[var(--dash-text)]">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === "truefalse" && (
          <div className="flex gap-4">
            {[true, false].map((v) => (
              <label key={String(v)} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer font-semibold transition-all ${
                answers[q.id] === v ? "border-purple-600 bg-purple-50 text-purple-700" : "border-[var(--dash-border)] text-[var(--dash-text-muted)]"
              }`}>
                <input type="radio" name={q.id} className="sr-only" checked={answers[q.id] === v} onChange={() => setAnswers({ ...answers, [q.id]: v })} />
                {v ? "True" : "False"}
              </label>
            ))}
          </div>
        )}

        {(q.type === "short" || q.type === "essay") && (
          <textarea value={(answers[q.id] as string) ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            placeholder="Type your answer here…" rows={4}
            className="w-full p-4 rounded-xl border-2 border-[var(--dash-border)] text-sm focus:border-purple-600 outline-none resize-none transition-colors bg-[var(--dash-surface)] text-[var(--dash-text)]" />
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex items-center justify-between bg-[var(--dash-surface)]">
        <Button variant="outline" size="sm" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        {/* Dot nav */}
        <div className="hidden sm:flex gap-1.5">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                i === current ? "bg-purple-700 text-white" :
                answers[questions[i].id] !== undefined ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {current < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrent(current + 1)} className="bg-purple-700 hover:bg-purple-800 text-white border-0">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <Send className="w-4 h-4" /> {submitting ? "Finishing…" : "Finish Practice"}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Results panel ───────────────────────────────────────────────────────────

function PracticeResults({
  questions,
  answers,
  meta,
  onRetry,
}: {
  questions: Question[];
  answers: Record<string, unknown>;
  meta: PracticeMeta;
  onRetry: () => void;
}) {
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const isCorrect = (q: Question) => {
    const ans = answers[q.id];
    if (q.type === "mcq") return ans === q.correctIndex;
    if (q.type === "truefalse") return ans === q.correctBool;
    if (q.type === "short") {
      const given = String(ans ?? "").trim().toLowerCase();
      return (q.acceptedAnswers ?? []).some((a) => a.trim().toLowerCase() === given);
    }
    return false;
  };

  const correctCount = questions.filter(isCorrect).length;
  const percent = Math.round((correctCount / questions.length) * 100);
  const level = percent >= 80 ? { label: "Excellent!", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-300" }
    : percent >= 60 ? { label: "Good work!", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" }
    : percent >= 40 ? { label: "Keep practising", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
    : { label: "Needs work", color: "text-red-600", bg: "bg-red-50 border-red-200" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card><CardBody className="text-center py-5">
          <p className={`text-4xl font-black ${percent >= 60 ? "text-emerald-600" : "text-red-500"}`}>{percent}%</p>
          <p className="text-xs text-[var(--dash-text-faint)] mt-1 uppercase tracking-wide">Score</p>
        </CardBody></Card>
        <Card><CardBody className="text-center py-5">
          <p className="text-4xl font-black text-[var(--dash-text)]">{correctCount}/{questions.length}</p>
          <p className="text-xs text-[var(--dash-text-faint)] mt-1 uppercase tracking-wide">Correct</p>
        </CardBody></Card>
        <Card className={`border-2 ${level.bg}`}><CardBody className="text-center py-5">
          <p className={`text-xl font-black ${level.color}`}>{level.label}</p>
          <p className="text-xs text-[var(--dash-text-faint)] mt-1">{meta.subject}</p>
        </CardBody></Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-[var(--dash-text)]">Question breakdown</h2>
        {questions.map((q, i) => {
          const correct = isCorrect(q);
          const expanded = expandedQ === q.id;
          return (
            <div key={q.id} className={`border rounded-xl overflow-hidden ${correct ? "border-emerald-200" : "border-red-200"}`}>
              <div className={`px-4 py-3 flex items-start justify-between gap-3 ${correct ? "bg-emerald-50" : "bg-red-50"}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 text-white ${correct ? "bg-emerald-500" : "bg-red-500"}`}>{i + 1}</div>
                  <p className="text-sm font-medium text-[var(--dash-text)] line-clamp-2">{q.text}</p>
                </div>
                <button onClick={() => setExpandedQ(expanded ? null : q.id)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {expanded && (
                <div className="px-4 py-4 bg-[var(--dash-surface)] space-y-3 text-sm">
                  {!correct && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--dash-text-muted)] mb-1">Correct answer</p>
                      <p className="px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold">
                        {q.type === "mcq" && q.correctIndex !== undefined ? q.options?.[q.correctIndex] : q.type === "truefalse" ? (q.correctBool ? "True" : "False") : (q.acceptedAnswers ?? []).join(" / ")}
                      </p>
                    </div>
                  )}
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">Explanation</p>
                      <p className="text-xs text-blue-700">{q.explanation}</p>
                    </div>
                  )}
                  {(q as Question & { workedSolution?: string }).workedSolution && (
                    <div className="bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-[var(--dash-text-muted)] mb-0.5">Worked solution</p>
                      <p className="text-xs text-[var(--dash-text)] whitespace-pre-wrap font-mono">
                        {(q as Question & { workedSolution?: string }).workedSolution}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button onClick={onRetry} className="bg-purple-700 hover:bg-purple-800 text-white border-0">
          <RefreshCw className="w-4 h-4" /> Practice again
        </Button>
        <Button variant="outline" onClick={() => window.print()}>Print results</Button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function StudentPracticePage() {
  const { profile, institution } = useAuth();
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [gaps, setGaps] = useState<Record<string, unknown>[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [meta, setMeta] = useState<PracticeMeta>({ subject: "", topic: "", difficulty: "medium" });
  const [finalAnswers, setFinalAnswers] = useState<Record<string, unknown>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile || !institution) return;

    // Check sessionStorage for questions passed from result page
    const rawQ = sessionStorage.getItem("practiceQuestions");
    const rawM = sessionStorage.getItem("practiceMeta");
    if (rawQ && rawM) {
      try {
        const qs: Question[] = JSON.parse(rawQ);
        const m: PracticeMeta = JSON.parse(rawM);
        sessionStorage.removeItem("practiceQuestions");
        sessionStorage.removeItem("practiceMeta");
        if (qs.length > 0) {
          setQuestions(qs);
          setMeta(m);
          setPageState("running");
          return;
        }
      } catch { /* fall through */ }
    }

    // Load learning gaps
    getLearningGaps(institution.id, profile.uid)
      .then((g) => { setGaps(g); setPageState("gaps"); })
      .catch(() => { setGaps([]); setPageState("gaps"); });
  }, [profile, institution]);

  const generateForGap = async (gap: Record<string, unknown>) => {
    if (!institution || !profile) return;
    setGeneratingFor(String(gap.id ?? gap.topic));
    setError("");
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: institution.id,
          subject: gap.subject,
          className: profile.className || profile.classNames?.[0] || "",
          topic: gap.topic,
          count: 10,
          type: "mcq",
          difficulty: Number(gap.accuracy) < 40 ? "easy" : "medium",
          context: "General",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      setQuestions(data.questions);
      setMeta({ subject: String(gap.subject), topic: String(gap.topic), difficulty: Number(gap.accuracy) < 40 ? "easy" : "medium" });
      setPageState("running");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate questions");
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleDone = async (answers: Record<string, unknown>) => {
    setFinalAnswers(answers);
    // Update learning gap accuracy
    if (institution && profile && meta.subject && meta.topic) {
      const correct = questions.filter((q) => {
        const ans = answers[q.id];
        if (q.type === "mcq") return ans === q.correctIndex;
        if (q.type === "truefalse") return ans === q.correctBool;
        return false;
      }).length;
      const percent = Math.round((correct / questions.length) * 100);
      void upsertLearningGap(institution.id, profile.uid, meta.subject, meta.topic, percent);
    }
    setPageState("results");
  };

  if (pageState === "loading") {
    return (
      <DashboardShell role="student" navItems={studentNav} title="Practice">
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="student" navItems={studentNav} title="AI Practice" subtitle="Practise topics where you need the most work">
      <div className="max-w-3xl space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {pageState === "running" && (
          <PracticeRunner questions={questions} meta={meta} onDone={handleDone} />
        )}

        {pageState === "results" && (
          <PracticeResults questions={questions} answers={finalAnswers} meta={meta}
            onRetry={() => { setQuestions([]); setFinalAnswers({}); setPageState("gaps"); }} />
        )}

        {pageState === "gaps" && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-800">
              <p className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Practice</p>
              <p className="text-xs text-purple-600 mt-1">Click <strong>Practice</strong> on any topic to generate 10 AI questions focused on where you need the most work.</p>
            </div>

            {gaps.length === 0 ? (
              <div className="border border-dashed border-[var(--dash-border)] rounded-xl p-10 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="font-semibold text-[var(--dash-text)]">No weak areas tracked yet!</p>
                <p className="text-sm text-[var(--dash-text-muted)] mt-1">Take some assessments and use "Practice similar" on wrong answers to see gaps here.</p>
              </div>
            ) : (
              <Card>
                <div className="divide-y divide-[var(--dash-border)]">
                  {gaps.map((gap) => {
                    const acc = Number(gap.accuracy);
                    const badgeCls = acc < 40 ? "bg-red-100 text-red-700" : acc < 60 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700";
                    return (
                      <div key={String(gap.id)} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--dash-surface-alt)] transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-[var(--dash-text)]">{String(gap.topic)}</p>
                          <p className="text-xs text-[var(--dash-text-muted)]">{String(gap.subject)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${badgeCls}`}>{acc}% accuracy</span>
                            <span className="text-xs text-[var(--dash-text-faint)]">{Number(gap.attemptCount)} attempt{Number(gap.attemptCount) !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => void generateForGap(gap)}
                          disabled={generatingFor === String(gap.id ?? gap.topic)}
                          className="bg-purple-700 hover:bg-purple-800 text-white border-0 shrink-0">
                          {generatingFor === String(gap.id ?? gap.topic) ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                          ) : (
                            <><Sparkles className="w-3.5 h-3.5" /> Practice</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    </DashboardShell>
  );
}
