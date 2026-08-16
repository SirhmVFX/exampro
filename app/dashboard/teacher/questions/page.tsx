"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Library, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Modal } from "@/app/components/ui/modal";
import { EmptyState } from "@/app/components/ui/empty";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import { HtmlContent, isEmptyHtml } from "@/app/components/ui/html-content";
import { StudentPicker } from "@/app/components/ui/student-picker";
import { useAuth } from "@/lib/auth-context";
import {
  listQuestions,
  saveQuestion,
  saveAssessment,
  listUsers,
  deleteQuestion,
  incrementAiUsage,
  newId,
  COL,
} from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";
import { downloadCsv } from "@/lib/csv";
import { parseQuestionCsv, questionCsvTemplate } from "@/lib/question-csv";
import type { Question, QuestionType, UserProfile } from "@/lib/types";
import { formatDate, inputClass, TYPE_LABEL } from "@/lib/utils";

const emptyForm = {
  subject: "",
  className: "",
  topic: "",
  type: "mcq" as QuestionType,
  text: "",
  points: 1,
  explanation: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctBool: true,
  acceptedAnswers: "",
  language: "javascript" as Question["language"],
  starterCode: "function solve(input) {\n  // your code\n}\n",
  testCases: [{ input: "", expectedOutput: "" }],
  skill: "",
  shared: false,
};

type FormState = typeof emptyForm;

function QuestionFields({
  form,
  setForm,
  subjects,
  classes,
  classLabel,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  subjects: string[];
  classes: string[];
  classLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Subject</label>
          {subjects.length ? (
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select…</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={inputClass}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">{classLabel}</label>
          {classes.length ? (
            <select
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select…</option>
              {classes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input
              required
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className={inputClass}
            />
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Type</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as QuestionType })
            }
            className={inputClass}
          >
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Points</label>
          <input
            type="number"
            min={1}
            value={form.points}
            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Topic</label>
          <input
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Skill</label>
          <input
            value={form.skill}
            onChange={(e) => setForm({ ...form, skill: e.target.value })}
            className={inputClass}
            placeholder="React"
          />
        </div>
        <label className="flex items-center gap-2 text-sm mt-6">
          <input
            type="checkbox"
            checked={form.shared}
            onChange={(e) => setForm({ ...form, shared: e.target.checked })}
          />
          Share with the department bank
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Question</label>
        <WysiwygEditor
          content={form.text}
          onChange={(text) => setForm({ ...form, text })}
          placeholder="Type the question. You can add images, lists and links."
          minHeight={140}
        />
      </div>
      {form.type === "mcq" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Options (mark the correct one)</label>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                checked={form.correctIndex === i}
                onChange={() => setForm({ ...form, correctIndex: i })}
              />
              <input
                value={opt}
                onChange={(e) => {
                  const options = [...form.options];
                  options[i] = e.target.value;
                  setForm({ ...form, options });
                }}
                className={inputClass}
                placeholder={`Option ${i + 1}`}
              />
            </div>
          ))}
        </div>
      )}
      {form.type === "truefalse" && (
        <div className="flex gap-3">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setForm({ ...form, correctBool: v })}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                form.correctBool === v
                  ? "bg-[var(--dash-primary)] text-[var(--dash-on-primary)] border-[var(--dash-primary)]"
                  : "border-gray-200"
              }`}
            >
              {v ? "True" : "False"}
            </button>
          ))}
        </div>
      )}
      {form.type === "short" && (
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Accepted answers (comma-separated)
          </label>
          <input
            value={form.acceptedAnswers}
            onChange={(e) => setForm({ ...form, acceptedAnswers: e.target.value })}
            className={inputClass}
          />
        </div>
      )}
      {form.type === "coding" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Language</label>
            <select
              value={form.language}
              onChange={(e) =>
                setForm({
                  ...form,
                  language: e.target.value as Question["language"],
                })
              }
              className={inputClass}
            >
              <option value="javascript">JavaScript (auto-graded)</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Starter code</label>
            <textarea
              rows={6}
              value={form.starterCode}
              onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
              className={`${inputClass} font-mono text-xs`}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Test cases</label>
            {form.testCases.map((tc, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Input (JSON args)"
                  value={tc.input}
                  onChange={(e) => {
                    const testCases = [...form.testCases];
                    testCases[i] = { ...tc, input: e.target.value };
                    setForm({ ...form, testCases });
                  }}
                  className={`${inputClass} font-mono text-xs`}
                />
                <input
                  placeholder="Expected output"
                  value={tc.expectedOutput}
                  onChange={(e) => {
                    const testCases = [...form.testCases];
                    testCases[i] = { ...tc, expectedOutput: e.target.value };
                    setForm({ ...form, testCases });
                  }}
                  className={`${inputClass} font-mono text-xs`}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setForm({
                  ...form,
                  testCases: [...form.testCases, { input: "", expectedOutput: "" }],
                })
              }
            >
              Add test case
            </Button>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">Explanation (optional)</label>
        <WysiwygEditor
          content={form.explanation}
          onChange={(explanation) => setForm({ ...form, explanation })}
          placeholder="Shown after grading"
          minHeight={100}
        />
      </div>
    </div>
  );
}

function toQuestion(
  form: FormState,
  meta: { institutionId: string; teacherId: string; id?: string; ai?: boolean }
): Question {
  const q: Question = {
    id: meta.id ?? newId(COL.questions),
    institutionId: meta.institutionId,
    teacherId: meta.teacherId,
    subject: form.subject,
    className: form.className,
    topic: form.topic || undefined,
    type: form.type,
    text: form.text,
    points: form.points || 1,
    explanation: form.explanation || undefined,
    skill: form.skill || undefined,
    shared: form.shared || undefined,
    aiGenerated: meta.ai,
    createdAt: Date.now(),
  };
  if (form.type === "mcq") {
    q.options = form.options.filter(Boolean);
    q.correctIndex = form.correctIndex;
  }
  if (form.type === "truefalse") q.correctBool = form.correctBool;
  if (form.type === "short") {
    q.acceptedAnswers = form.acceptedAnswers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (form.type === "coding") {
    q.language = form.language;
    q.starterCode = form.starterCode;
    q.testCases = form.testCases.filter((t) => t.input || t.expectedOutput);
  }
  return q;
}

function questionToForm(q: Question): FormState {
  const opts = [...(q.options ?? [])];
  while (opts.length < 4) opts.push("");
  return {
    subject: q.subject,
    className: q.className,
    topic: q.topic ?? "",
    type: q.type,
    text: q.text,
    points: q.points,
    explanation: q.explanation ?? "",
    options: opts.slice(0, 4),
    correctIndex: q.correctIndex ?? 0,
    correctBool: q.correctBool ?? true,
    acceptedAnswers: (q.acceptedAnswers ?? []).join(", "),
    language: q.language ?? "javascript",
    starterCode: q.starterCode ?? emptyForm.starterCode,
    testCases: q.testCases?.length ? q.testCases : [{ input: "", expectedOutput: "" }],
    skill: q.skill ?? "",
    shared: q.shared ?? false,
  };
}

function AssignBlock({
  saveToLibrary,
  assignAsQuiz,
  quizTitle,
  students,
  selectedIds,
  classFilter,
  onChange,
}: {
  saveToLibrary: boolean;
  assignAsQuiz: boolean;
  quizTitle: string;
  students: UserProfile[];
  selectedIds: string[];
  classFilter?: string;
  onChange: (p: {
    saveToLibrary?: boolean;
    assignAsQuiz?: boolean;
    quizTitle?: string;
    selectedIds?: string[];
  }) => void;
}) {
  return (
    <div className="border border-gray-200 p-3 space-y-3">
      <p className="text-sm font-medium">What to do with these questions</p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={saveToLibrary}
          onChange={(e) => onChange({ saveToLibrary: e.target.checked })}
        />
        Save to the question library
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={assignAsQuiz}
          onChange={(e) => onChange({ assignAsQuiz: e.target.checked })}
        />
        Publish as a quiz and assign to students
      </label>
      {assignAsQuiz && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">Quiz title</label>
            <input
              value={quizTitle}
              onChange={(e) => onChange({ quizTitle: e.target.value })}
              className={inputClass}
              placeholder="AI quiz — Algebra"
            />
          </div>
          <p className="text-xs text-gray-500">
            Pick one student or several. Leave none selected to assign to the whole class.
          </p>
          <StudentPicker
            students={students}
            selectedIds={selectedIds}
            onChange={(ids) => onChange({ selectedIds: ids })}
            classFilter={classFilter}
          />
        </div>
      )}
    </div>
  );
}

export default function TeacherQuestionsPage() {
  const { profile, institution, refresh } = useAuth();
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState({ type: "all", subject: "all" });
  const [ai, setAi] = useState({
    subject: "",
    className: "",
    topic: "",
    count: 5,
    type: "mcq" as QuestionType,
    difficulty: "medium",
    language: "javascript",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [preview, setPreview] = useState<Question[]>([]);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Question[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvSaving, setCsvSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [assignAsQuiz, setAssignAsQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const subjects = institution?.subjects ?? profile?.subjects ?? [];
  const classes = institution?.classes ?? profile?.classes ?? [];

  const reload = async () => {
    if (!institution || !profile) return;
    setItems(await listQuestions(institution.id, profile.uid));
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    listUsers(institution.id, "student").then(setStudents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile]);

  const filtered = items.filter((q) => {
    if (filter.type !== "all" && q.type !== filter.type) return false;
    if (filter.subject !== "all" && q.subject !== filter.subject) return false;
    return true;
  });

  const resetAssign = () => {
    setSaveToLibrary(true);
    setAssignAsQuiz(false);
    setQuizTitle("");
    setSelectedStudentIds([]);
  };

  const publishAssignedQuiz = async (questions: Question[], titleHint: string) => {
    if (!institution || !profile || !questions.length) return;
    const totalPoints = questions.reduce((s, q) => q.points + s, 0);
    await saveAssessment({
      id: newId(COL.assessments),
      institutionId: institution.id,
      teacherId: profile.uid,
      teacherName: profile.name,
      title: quizTitle.trim() || titleHint,
      kind: "quiz",
      subject: questions[0].subject,
      className: questions[0].className,
      questions,
      durationMins: Math.max(10, questions.length * 2),
      totalPoints,
      passPercent: 50,
      shuffleQuestions: true,
      allowRetake: false,
      maxAttempts: 1,
      showResultsImmediately: true,
      assignedStudentIds: selectedStudentIds.length ? selectedStudentIds : undefined,
      status: "published",
      createdAt: Date.now(),
    });
  };

  const importQuestions = async (questions: Question[], titleHint: string) => {
    if (!saveToLibrary && !assignAsQuiz) {
      throw new Error("Choose library, assign to students, or both.");
    }
    if (saveToLibrary) {
      await Promise.all(questions.map((q) => saveQuestion(q)));
    }
    if (assignAsQuiz) {
      await publishAssignedQuiz(questions, titleHint);
    }
  };

  const save = async () => {
    if (!institution || !profile) return;
    if (isEmptyHtml(form.text)) {
      setFormError("Question text is required.");
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await saveQuestion(
        toQuestion(form, { institutionId: institution.id, teacherId: profile.uid })
      );
      setOpen(false);
      setForm(emptyForm);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    if (!institution) return;
    setAiError("");
    const plan = getPlan(institution.plan);
    const allowed = planAllows(plan, { aiUsed: institution.aiGenerationsUsed });
    if (!allowed.ai) {
      setAiError(
        `You've used all ${plan.aiGenerationsPerMonth} AI generations on the ${plan.name} plan this cycle.`
      );
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ai),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await incrementAiUsage(institution.id);
      await refresh();
      const mapped: Question[] = (data.questions as Record<string, unknown>[]).map(
        (raw) => ({
          id: newId(COL.questions),
          institutionId: institution.id,
          teacherId: profile!.uid,
          subject: ai.subject,
          className: ai.className,
          topic: ai.topic || undefined,
          type: ai.type,
          text: String(raw.text ?? ""),
          points: Number(raw.points ?? 1),
          explanation: raw.explanation ? String(raw.explanation) : undefined,
          options: raw.options as string[] | undefined,
          correctIndex: raw.correctIndex as number | undefined,
          correctBool: raw.correctBool as boolean | undefined,
          acceptedAnswers: raw.acceptedAnswers as string[] | undefined,
          language: (raw.language as Question["language"]) ?? (ai.language as Question["language"]),
          starterCode: raw.starterCode as string | undefined,
          testCases: raw.testCases as Question["testCases"],
          aiGenerated: true,
          createdAt: Date.now(),
        })
      );
      setPreview(mapped);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const savePreview = async () => {
    setAiError("");
    try {
      await importQuestions(
        preview,
        `${ai.subject || "AI"} quiz${ai.topic ? ` — ${ai.topic}` : ""}`
      );
      setPreview([]);
      setAiOpen(false);
      resetAssign();
      await reload();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Couldn't save questions.");
    }
  };

  const handleCsvFile = async (file: File) => {
    if (!institution || !profile) return;
    const text = await file.text();
    const { questions, errors } = parseQuestionCsv(text, {
      institutionId: institution.id,
      teacherId: profile.uid,
      newId: () => newId(COL.questions),
      defaults: {
        subject: subjects[0] ?? "",
        className: classes[0] ?? "",
      },
    });
    setCsvErrors(errors);
    setCsvPreview(questions);
    if (questions.length === 1) {
      setForm(questionToForm(questions[0]));
    }
  };

  const saveCsv = async () => {
    setCsvSaving(true);
    try {
      await importQuestions(csvPreview, "Imported quiz");
      setCsvOpen(false);
      setCsvPreview([]);
      setCsvErrors([]);
      resetAssign();
      await reload();
    } catch (e) {
      setCsvErrors([e instanceof Error ? e.message : "Couldn't import."]);
    } finally {
      setCsvSaving(false);
    }
  };

  const assignPatch = (p: {
    saveToLibrary?: boolean;
    assignAsQuiz?: boolean;
    quizTitle?: string;
    selectedIds?: string[];
  }) => {
    if (p.saveToLibrary !== undefined) setSaveToLibrary(p.saveToLibrary);
    if (p.assignAsQuiz !== undefined) setAssignAsQuiz(p.assignAsQuiz);
    if (p.quizTitle !== undefined) setQuizTitle(p.quizTitle);
    if (p.selectedIds !== undefined) setSelectedStudentIds(p.selectedIds);
  };

  return (
    <DashboardShell
      role="teacher"
      navItems={teacherNav}
      title="Question library"
      subtitle="Build a bank of questions, including AI-generated ones"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            className={`${inputClass} w-auto`}
          >
            <option value="all">All subjects</option>
            {[...new Set(items.map((q) => q.subject))].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className={`${inputClass} w-auto`}
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={() => setAiOpen(true)}>
            <Sparkles className="w-4 h-4" /> Generate with AI
          </Button>
          <Button
            onClick={() => {
              setForm({
                ...emptyForm,
                subject: subjects[0] ?? "",
                className: classes[0] ?? "",
              });
              setOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> New question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">{filtered.length} questions</h2>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Library className="w-6 h-6" />}
                title="Your library is empty"
                description="Add questions manually or generate them with Gemini."
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((q) => (
                  <div key={q.id} className="px-6 py-4 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge>{TYPE_LABEL[q.type]}</Badge>
                        <Badge variant="outline">{q.subject}</Badge>
                        <Badge variant="info">{q.className}</Badge>
                        {q.aiGenerated && (
                          <Badge variant="warning">
                            <Wand2 className="w-3 h-3 mr-1" /> AI
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">{q.points} pts</span>
                      </div>
                      <HtmlContent html={q.text} compact className="text-sm text-gray-900" />
                      <p className="text-xs text-gray-400 mt-1">{formatDate(q.createdAt)}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this question?")) return;
                        await deleteQuestion(q.id);
                        await reload();
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New question"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              Save to library
            </Button>
          </>
        }
      >
        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
        <QuestionFields
          form={form}
          setForm={setForm}
          subjects={subjects}
          classes={classes}
          classLabel={institution?.classLabel ?? "Class"}
        />
      </Modal>

      <Modal
        open={aiOpen}
        onClose={() => {
          setAiOpen(false);
          setPreview([]);
          resetAssign();
        }}
        title="Generate questions with Gemini"
        wide
        footer={
          preview.length ? (
            <>
              <Button variant="ghost" onClick={() => setPreview([])}>
                Discard
              </Button>
              <Button onClick={() => void savePreview()}>
                {assignAsQuiz
                  ? `Save & assign (${preview.length})`
                  : `Save ${preview.length} to library`}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setAiOpen(false)}>
                Close
              </Button>
              <Button loading={aiLoading} onClick={() => void generate()}>
                <Sparkles className="w-4 h-4" /> Generate
              </Button>
            </>
          )
        }
      >
        {aiError && <p className="text-sm text-red-600 mb-3">{aiError}</p>}
        {preview.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Uses the Gemini free API. This counts as 1 generation against your
              plan ({institution?.aiGenerationsUsed ?? 0} used this cycle).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input
                  value={ai.subject}
                  onChange={(e) => setAi({ ...ai, subject: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {institution?.classLabel ?? "Class"}
                </label>
                <input
                  value={ai.className}
                  onChange={(e) => setAi({ ...ai, className: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Topic</label>
                <input
                  value={ai.topic}
                  onChange={(e) => setAi({ ...ai, topic: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <select
                  value={ai.type}
                  onChange={(e) =>
                    setAi({ ...ai, type: e.target.value as QuestionType })
                  }
                  className={inputClass}
                >
                  {Object.entries(TYPE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={ai.count}
                  onChange={(e) => setAi({ ...ai, count: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Difficulty</label>
                <select
                  value={ai.difficulty}
                  onChange={(e) => setAi({ ...ai, difficulty: e.target.value })}
                  className={inputClass}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {preview.map((q) => (
              <div key={q.id} className="border p-3">
                <HtmlContent html={q.text} className="text-sm font-medium" />
                {q.options && (
                  <ul className="mt-2 text-xs text-gray-600 list-disc pl-5">
                    {q.options.map((o, i) => (
                      <li
                        key={`${q.id}-${i}`}
                        className={i === q.correctIndex ? "font-semibold text-emerald-700" : ""}
                      >
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            <AssignBlock
              saveToLibrary={saveToLibrary}
              assignAsQuiz={assignAsQuiz}
              quizTitle={quizTitle}
              students={students}
              selectedIds={selectedStudentIds}
              classFilter={ai.className || undefined}
              onChange={assignPatch}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={csvOpen}
        onClose={() => {
          setCsvOpen(false);
          setCsvPreview([]);
          setCsvErrors([]);
          resetAssign();
        }}
        title="Import questions from CSV"
        wide
        footer={
          csvPreview.length ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setCsvPreview([]);
                  setCsvErrors([]);
                }}
              >
                Choose another file
              </Button>
              <Button loading={csvSaving} onClick={() => void saveCsv()}>
                {assignAsQuiz
                  ? `Import & assign (${csvPreview.length})`
                  : `Import ${csvPreview.length} to library`}
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setCsvOpen(false)}>
              Close
            </Button>
          )
        }
      >
        {csvPreview.length === 0 ? (
          <div className="space-y-4 text-sm">
            <p className="text-gray-600">
              Upload a CSV and each row fills a question plus its options. Download
              the template so the columns match.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadCsv("exampro-questions-template.csv", questionCsvTemplate())}
            >
              Download CSV template
            </Button>
            <div className="border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900">Required columns</p>
              <p>
                <code>type,text,option_a,option_b,option_c,option_d,correct,points,explanation,subject,class,topic,skill</code>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>type</strong>: mcq, truefalse, short, essay, coding, or project.
                  Leave blank to treat rows with options as mcq.
                </li>
                <li>
                  <strong>text</strong>: the question stem (required).
                </li>
                <li>
                  <strong>option_a … option_d</strong>: MCQ choices. Extra options can be{" "}
                  <code>option_e</code>.
                </li>
                <li>
                  <strong>correct</strong>: for MCQ use A/B/C/D, 1–4, or the option
                  text. For true/false use true or false. For short answers, pipe- or
                  comma-separated accepted answers.
                </li>
                <li>
                  <strong>subject</strong> and <strong>class</strong>: optional if your
                  institution already has a first subject/class (those are used as
                  defaults).
                </li>
              </ul>
              <p>
                Wrap cells that contain commas in double quotes. Example:{" "}
                <code>mcq,&quot;What is 2 + 2?&quot;,3,4,5,6,B,1,,Mathematics,JSS 1,,</code>
              </p>
            </div>
            <label className="block">
              <span className="block text-sm font-medium mb-1.5">CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className={inputClass}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleCsvFile(file);
                }}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {csvErrors.length > 0 && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 space-y-1">
                {csvErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600">
              {csvPreview.length} question{csvPreview.length === 1 ? "" : "s"} ready.
              Options are filled from the CSV. You can load one into the new-question
              form to edit before saving.
            </p>
            {csvPreview.map((q) => (
              <div key={q.id} className="border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{TYPE_LABEL[q.type]}</Badge>
                  <Badge variant="outline">{q.subject}</Badge>
                  <span className="text-xs text-gray-400">{q.points} pts</span>
                  <button
                    type="button"
                    className="ml-auto text-xs font-medium text-[var(--dash-primary)]"
                    onClick={() => {
                      setForm(questionToForm(q));
                      setCsvOpen(false);
                      setOpen(true);
                    }}
                  >
                    Load into editor
                  </button>
                </div>
                <HtmlContent html={q.text} className="text-sm" />
                {q.options && (
                  <div className="space-y-1">
                    {q.options.map((o, i) => (
                      <div
                        key={`${q.id}-opt-${i}`}
                        className={`text-xs border px-2 py-1.5 ${
                          i === q.correctIndex
                            ? "border-emerald-600 font-semibold text-emerald-800"
                            : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {o}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <AssignBlock
              saveToLibrary={saveToLibrary}
              assignAsQuiz={assignAsQuiz}
              quizTitle={quizTitle}
              students={students}
              selectedIds={selectedStudentIds}
              classFilter={csvPreview[0]?.className}
              onChange={assignPatch}
            />
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
