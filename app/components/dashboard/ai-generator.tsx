"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Trash2,
  Save,
  RefreshCw,
  ArrowRight,
  Library,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ImageUpload } from "@/app/components/ui/image-upload";
import { useAuth } from "@/lib/auth-context";
import {
  incrementAiUsage,
  newId,
  COL,
  saveQuestion,
  saveQuestionSet,
} from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import type { Question, QuestionType, QuestionDifficulty } from "@/lib/types";
import { inputClass, TYPE_LABEL } from "@/lib/utils";

type GenFormat = "mixed" | "mcq" | "truefalse" | "short" | "essay" | "coding";

const FORMATS: { value: GenFormat; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "mcq", label: "Multiple choice" },
  { value: "truefalse", label: "True / False" },
  { value: "short", label: "Short answer" },
  { value: "essay", label: "Essay" },
  { value: "coding", label: "Coding" },
];

const DIFFICULTIES: { value: QuestionDifficulty; label: string }[] = [
  { value: "support", label: "Support (easier)" },
  { value: "core", label: "Core (standard)" },
  { value: "extension", label: "Extension (harder)" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const CONTEXTS = ["Real-life", "Exam-style", "Problem-solving", "Abstract"];

const CURRICULA = [
  "General",
  "Victorian Curriculum 2.0 (VCAA)",
  "Common Core",
  "Cambridge / IGCSE",
  "West African (WAEC/NECO)",
  "South African (CAPS)",
  "Custom",
];

interface GeneratedQuestion {
  type: QuestionType;
  text: string;
  points: number;
  options?: string[];
  correctIndex?: number;
  correctBool?: boolean;
  acceptedAnswers?: string[];
  explanation?: string;
  workedSolution?: string;
  imageUrl?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
  language?: Question["language"];
}

export default function AiGenerator() {
  const { institution, profile } = useAuth();
  const subjects = institution?.subjects ?? [];
  const classes = institution?.classes ?? [];

  const [form, setForm] = useState({
    curriculum: "General",
    className: "",
    subject: "",
    customSubject: "",
    topic: "",
    subtopic: "",
    count: 10,
    difficulty: "core" as QuestionDifficulty,
    format: "mixed" as GenFormat,
    context: "Real-life",
    extraPrompt: "",
    title: "",
  });
  const [subjectMode, setSubjectMode] = useState<"select" | "custom">("select");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<GeneratedQuestion[]>([]);
  const [saved, setSaved] = useState(false);

  const resolvedSubject =
    subjectMode === "custom" ? form.customSubject.trim() : form.subject.trim();

  const plan = institution ? getPlan(institution.plan) : null;
  const aiLeft =
    plan && plan.aiGenerationsPerMonth !== -1
      ? Math.max(
          0,
          plan.aiGenerationsPerMonth - (institution?.aiGenerationsUsed ?? 0),
        )
      : null;

  const autoTitle = useMemo(() => {
    const t = form.topic || resolvedSubject || "AI";
    return `${t} — ${DIFFICULTIES.find((d) => d.value === form.difficulty)?.label.split(" ")[0] ?? "Core"}`;
  }, [form.topic, form.difficulty, resolvedSubject]);

  const set = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const generate = async () => {
    setError("");
    if (!institution?.id) {
      setError("No institution loaded — refresh and try again.");
      return;
    }
    if (!resolvedSubject) {
      setError("Choose or type a subject before generating.");
      return;
    }
    if (!form.count || form.count < 1) {
      setError("Enter how many questions you want (1–100).");
      return;
    }
    const allowed = planAllows(plan!, {
      aiUsed: institution.aiGenerationsUsed,
    });
    if (!allowed.ai) {
      setError(
        `You've used all ${plan!.aiGenerationsPerMonth} AI generations this cycle. Upgrade in Billing.`,
      );
      return;
    }
    setLoading(true);
    setSaved(false);
    setResults([]);
    setProgress("Generating…");
    try {
      const curriculumNote =
        form.curriculum && form.curriculum !== "General"
          ? `Align content to the ${form.curriculum} curriculum.`
          : "";
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId: institution.id,
          subject: resolvedSubject,
          className: form.className || "General",
          topic: form.topic || undefined,
          skill: form.subtopic || undefined,
          count: Math.min(Math.max(1, form.count), 100),
          type: form.format,
          difficulty: form.difficulty,
          format: FORMATS.find((f) => f.value === form.format)?.label,
          context: form.context,
          language: form.format === "coding" ? "javascript" : undefined,
          extraPrompt: [curriculumNote, form.extraPrompt.trim()].filter(Boolean).join(" "),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProgress("Finalising…");
      await incrementAiUsage(institution.id);
      setResults((data.questions as GeneratedQuestion[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const toQuestion = (raw: GeneratedQuestion): Question => ({
    id: newId(COL.questions),
    institutionId: institution!.id,
    teacherId: profile!.uid,
    subject: resolvedSubject,
    className: form.className || "General",
    topic: form.topic || undefined,
    skill: form.subtopic || undefined,
    difficulty: form.difficulty,
    type: raw.type,
    text: String(raw.text ?? ""),
    points: Number(raw.points ?? 1),
    explanation: raw.explanation,
    workedSolution: raw.workedSolution,
    imageUrl: raw.imageUrl || undefined,
    options: raw.options,
    correctIndex: raw.correctIndex,
    correctBool: raw.correctBool,
    acceptedAnswers: raw.acceptedAnswers,
    language: raw.language ?? (form.format === "coding" ? "javascript" : undefined),
    starterCode: raw.starterCode,
    testCases: raw.testCases,
    aiGenerated: true,
    createdAt: Date.now(),
  });

  const saveToLibrary = async () => {
    if (!institution || !profile || results.length === 0) return;
    try {
      const qs = results.map(toQuestion);
      const title = form.title.trim() || autoTitle;
      await saveQuestionSet({
        id: newId(COL.questionSets),
        institutionId: institution.id,
        teacherId: profile.uid,
        teacherName: profile.name,
        title,
        subject: resolvedSubject,
        className: form.className || "General",
        topic: form.topic || undefined,
        skill: form.subtopic || undefined,
        difficulty: form.difficulty,
        format: FORMATS.find((f) => f.value === form.format)?.label,
        questions: qs,
        questionCount: qs.length,
        aiGenerated: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      await Promise.all(qs.map((q) => saveQuestion(q)));
      setSaved(true);
      toast.success(`Saved "${title}" to the question library`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save to library.");
    }
  };

  const removeResult = (i: number) =>
    setResults((prev) => prev.filter((_, idx) => idx !== i));

  const patchResult = (i: number, patch: Partial<GeneratedQuestion>) =>
    setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const bankHref =
    profile?.role === "admin"
      ? "/dashboard/admin/questions"
      : "/dashboard/teacher/questions";
  const newAssessmentHref =
    profile?.role === "admin"
      ? "/dashboard/admin/assessments/new"
      : "/dashboard/teacher/assessments/new";

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Config form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--dash-primary)]" />
              <h2 className="text-sm font-semibold tracking-wide text-[var(--dash-text-muted)] uppercase">
                01 · Build your question set
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Curriculum">
              <select
                value={form.curriculum}
                onChange={(e) => set({ curriculum: e.target.value })}
                className={inputClass}
              >
                {CURRICULA.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Year level / class">
                <select
                  value={form.className}
                  onChange={(e) => set({ className: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Subject"
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setSubjectMode((m) => (m === "custom" ? "select" : "custom"))
                    }
                    className="text-xs font-medium text-[var(--dash-primary)]"
                  >
                    {subjectMode === "custom" ? "Pick from list" : "Type custom"}
                  </button>
                }
              >
                {subjectMode === "custom" ? (
                  <input
                    value={form.customSubject}
                    onChange={(e) => set({ customSubject: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Biology"
                  />
                ) : (
                  <select
                    value={form.subject}
                    onChange={(e) => set({ subject: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <Field
              label="Topic"
              action={
                <span className="text-xs text-[var(--dash-text-faint)]">type freely</span>
              }
            >
              <input
                value={form.topic}
                onChange={(e) => set({ topic: e.target.value })}
                className={inputClass}
                placeholder="e.g. Photosynthesis"
              />
            </Field>

            <Field label="Subtopic (optional)">
              <input
                value={form.subtopic}
                onChange={(e) => set({ subtopic: e.target.value })}
                className={inputClass}
                placeholder="Narrow the focus"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Questions">
                <select
                  value={form.count}
                  onChange={(e) => set({ count: Number(e.target.value) })}
                  className={inputClass}
                >
                  {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Difficulty">
                <select
                  value={form.difficulty}
                  onChange={(e) => set({ difficulty: e.target.value as QuestionDifficulty })}
                  className={inputClass}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Question format">
              <select
                value={form.format}
                onChange={(e) => set({ format: e.target.value as GenFormat })}
                className={inputClass}
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Context">
              <select
                value={form.context}
                onChange={(e) => set({ context: e.target.value })}
                className={inputClass}
              >
                {CONTEXTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Prompt / extra instructions">
              <textarea
                rows={3}
                value={form.extraPrompt}
                onChange={(e) => set({ extraPrompt: e.target.value })}
                className={inputClass}
                placeholder="Give the generator a detailed prompt to shape the questions."
              />
            </Field>

            <Field label="Set title (for library)">
              <input
                value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                className={inputClass}
                placeholder={autoTitle}
              />
            </Field>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button fullWidth size="lg" loading={loading} onClick={() => void generate()}>
              <Sparkles className="w-4 h-4" />
              {loading ? progress || "Generating…" : "Generate questions"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
            {aiLeft !== null && (
              <p className="text-xs text-center text-[var(--dash-text-faint)]">
                {aiLeft} AI generation{aiLeft === 1 ? "" : "s"} left on your{" "}
                {plan?.name} plan this cycle.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {results.length === 0 && !loading ? (
            <Card>
              <CardBody className="py-20">
                <div className="flex flex-col items-center text-center gap-2">
                  <Sparkles className="w-8 h-8 text-[var(--dash-primary)] opacity-60" />
                  <p className="text-lg font-medium text-[var(--dash-text)]">
                    Your generated questions will appear here
                  </p>
                  <p className="text-sm text-[var(--dash-text-muted)]">
                    Fill in the form and click Generate
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : loading ? (
            <Card>
              <CardBody className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-[var(--dash-surface-alt)] rounded-lg animate-pulse" />
                ))}
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                        {results.length} questions generated
                      </h2>
                      <p className="text-sm text-[var(--dash-text-muted)]">
                        {resolvedSubject}
                        {form.topic ? ` · ${form.topic}` : ""} ·{" "}
                        {FORMATS.find((f) => f.value === form.format)?.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => void generate()}>
                        <RefreshCw className="w-4 h-4" /> Regenerate
                      </Button>
                      <Button size="sm" onClick={() => void saveToLibrary()} disabled={saved}>
                        {saved ? (
                          <>
                            <Library className="w-4 h-4" /> Saved
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save to library
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {results.map((q, i) => (
                    <div
                      key={i}
                      className="border border-[var(--dash-border)] rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[var(--dash-text-faint)]">
                            Q{i + 1}
                          </span>
                          <Badge variant="outline">{TYPE_LABEL[q.type] ?? q.type}</Badge>
                          <span className="text-xs text-[var(--dash-text-muted)]">
                            {q.points} pt{q.points === 1 ? "" : "s"}
                          </span>
                        </div>
                        <button
                          onClick={() => removeResult(i)}
                          className="p-1.5 rounded-md text-[var(--dash-text-faint)] hover:text-red-600 transition"
                          title="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-[var(--dash-text)] mt-2">{q.text}</p>
                      {q.options && (
                        <ul className="mt-2 space-y-1 text-sm text-[var(--dash-text-muted)]">
                          {q.options.map((opt, oi) => (
                            <li key={oi} className="flex items-center gap-2">
                              {oi === q.correctIndex && (
                                <span className="text-emerald-600 font-bold">✓</span>
                              )}
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {q.type === "truefalse" && (
                        <p className="mt-2 text-sm">
                          <span className="text-[var(--dash-text-muted)]">Answer: </span>
                          <span className="font-medium text-[var(--dash-text)]">
                            {q.correctBool ? "True" : "False"}
                          </span>
                        </p>
                      )}
                      {q.acceptedAnswers && q.acceptedAnswers.length > 0 && (
                        <p className="mt-2 text-sm text-[var(--dash-text-muted)]">
                          Accepted: {q.acceptedAnswers.join(" · ")}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="mt-2 text-xs text-[var(--dash-text-faint)] italic">
                          {q.explanation}
                        </p>
                      )}
                      <div className="mt-3">
                        <ImageUpload
                          label=""
                          value={q.imageUrl ?? ""}
                          onChange={(imageUrl) => patchResult(i, { imageUrl })}
                          folder="exampro/question-images"
                        />
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>

              {saved && (
                <Card>
                  <CardBody className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-[var(--dash-text-muted)] flex-1 min-w-[200px]">
                      Saved to your question library as a subject folder. Import it when
                      creating any test, exam, assignment or practice.
                    </p>
                    <Link href={bankHref}>
                      <Button variant="outline" size="sm">
                        <Library className="w-4 h-4" /> View library
                      </Button>
                    </Link>
                    <Link href={newAssessmentHref}>
                      <Button size="sm">
                        <FileText className="w-4 h-4" /> Create assessment
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold tracking-wide text-[var(--dash-text-muted)] uppercase">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}
