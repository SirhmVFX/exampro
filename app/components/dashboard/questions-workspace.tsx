"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  Layers,
  Library,
  List,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { teacherNav, adminNav } from "@/app/components/dashboard/nav";
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
  listQuestionSets,
  saveQuestion,
  saveQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
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
import type {
  AssessmentKind,
  Question,
  QuestionDifficulty,
  QuestionSet,
  QuestionType,
  UserProfile,
} from "@/lib/types";
import { formatDate, inputClass, TYPE_LABEL } from "@/lib/utils";

export const MAX_QUESTIONS_PER_SET = 100;

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  support: "Support",
  core: "Core",
  extension: "Extension",
};

const emptyForm = {
  subject: "",
  className: "",
  topic: "",
  type: "mcq" as QuestionType,
  text: "",
  points: 1,
  difficulty: "medium" as QuestionDifficulty,
  explanation: "",
  workedSolution: "",
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
  compact,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  subjects: string[];
  classes: string[];
  classLabel: string;
  compact?: boolean;
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
        {!compact && (
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {classLabel}
            </label>
            {classes.length ? (
              <select
                value={form.className}
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({ ...form, className: e.target.value })
                }
                className={inputClass}
              />
            )}
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-4 gap-4">
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
            onChange={(e) =>
              setForm({ ...form, points: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm({
                ...form,
                difficulty: e.target.value as QuestionDifficulty,
              })
            }
            className={inputClass}
          >
            {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
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
        {!compact && (
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={form.shared}
              onChange={(e) => setForm({ ...form, shared: e.target.checked })}
            />
            Share with the department bank
          </label>
        )}
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
          <label className="block text-sm font-medium">
            Options (mark the correct one)
          </label>
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
            onChange={(e) =>
              setForm({ ...form, acceptedAnswers: e.target.value })
            }
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
            <label className="block text-sm font-medium mb-1.5">
              Starter code
            </label>
            <textarea
              rows={6}
              value={form.starterCode}
              onChange={(e) =>
                setForm({ ...form, starterCode: e.target.value })
              }
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
                  testCases: [
                    ...form.testCases,
                    { input: "", expectedOutput: "" },
                  ],
                })
              }
            >
              Add test case
            </Button>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Explanation (optional)
        </label>
        <WysiwygEditor
          content={form.explanation}
          onChange={(explanation) => setForm({ ...form, explanation })}
          placeholder="Shown after grading"
          minHeight={100}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Worked solution (optional)
        </label>
        <textarea
          rows={4}
          value={form.workedSolution}
          onChange={(e) => setForm({ ...form, workedSolution: e.target.value })}
          className={inputClass}
          placeholder={"1. First step…\n2. Second step…\n3. Final answer."}
        />
      </div>
    </div>
  );
}

function toQuestion(
  form: FormState,
  meta: { institutionId: string; teacherId: string; id?: string; ai?: boolean },
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
    difficulty: form.difficulty,
    explanation: form.explanation || undefined,
    workedSolution: form.workedSolution || undefined,
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

function questionToForm(
  q: Question,
  defaults?: { subject?: string; className?: string },
): FormState {
  const opts = [...(q.options ?? [])];
  while (opts.length < 4) opts.push("");
  return {
    subject: q.subject || defaults?.subject || "",
    className: q.className || defaults?.className || "",
    topic: q.topic ?? "",
    type: q.type,
    text: q.text,
    points: q.points,
    difficulty: q.difficulty ?? "medium",
    explanation: q.explanation ?? "",
    workedSolution: q.workedSolution ?? "",
    options: opts.slice(0, 4),
    correctIndex: q.correctIndex ?? 0,
    correctBool: q.correctBool ?? true,
    acceptedAnswers: (q.acceptedAnswers ?? []).join(", "),
    language: q.language ?? "javascript",
    starterCode: q.starterCode ?? emptyForm.starterCode,
    testCases: q.testCases?.length
      ? q.testCases
      : [{ input: "", expectedOutput: "" }],
    skill: q.skill ?? "",
    shared: q.shared ?? false,
  };
}

/** Shows a full question with its answer, explanation and worked solution. */
export function QuestionReviewCard({
  q,
  index,
}: {
  q: Question;
  index: number;
}) {
  return (
    <div className="border border-[var(--dash-border)] rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-[var(--dash-primary)] text-[var(--dash-on-primary)] text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <Badge>{TYPE_LABEL[q.type]}</Badge>
        {q.difficulty && (
          <Badge variant="outline">
            {DIFFICULTY_LABEL[q.difficulty] ?? q.difficulty}
          </Badge>
        )}
        <span className="text-xs text-[var(--dash-text-faint)]">
          {q.points} pt{q.points !== 1 ? "s" : ""}
        </span>
        {q.aiGenerated && (
          <Badge variant="warning">
            <Wand2 className="w-3 h-3 mr-1" /> AI
          </Badge>
        )}
      </div>
      <HtmlContent html={q.text} className="text-sm text-[var(--dash-text)]" />
      {q.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={q.imageUrl}
          alt={`Diagram for question ${index + 1}`}
          className="max-h-56 w-auto border border-[var(--dash-border)] object-contain bg-white rounded-lg"
        />
      )}
      {q.type === "mcq" && q.options && (
        <div className="grid sm:grid-cols-2 gap-1.5">
          {q.options.map((opt, j) => (
            <div
              key={`${q.id}-opt-${j}`}
              className={`text-xs px-3 py-1.5 border rounded-lg ${
                j === q.correctIndex
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 font-bold"
                  : "border-[var(--dash-border)] text-[var(--dash-text-muted)]"
              }`}
            >
              {j === q.correctIndex && "✓ "}
              {String.fromCharCode(65 + j)}. {opt}
            </div>
          ))}
        </div>
      )}
      {q.type === "truefalse" && (
        <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 rounded-lg">
          <strong>Answer:</strong> {q.correctBool ? "True" : "False"}
        </div>
      )}
      {q.type === "short" && q.acceptedAnswers && (
        <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 rounded-lg">
          <strong>Accepted:</strong> {q.acceptedAnswers.join(", ")}
        </div>
      )}
      {q.type === "coding" && q.starterCode && (
        <pre className="bg-gray-950 text-gray-100 text-xs p-3 rounded-lg overflow-x-auto font-mono">
          {q.starterCode}
        </pre>
      )}
      {q.explanation && !isEmptyHtml(q.explanation) && (
        <div className="bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700 rounded-lg">
          <HtmlContent html={q.explanation} compact />
        </div>
      )}
      {q.workedSolution && (
        <div className="bg-gray-50 border border-[var(--dash-border)] px-3 py-2 text-xs text-[var(--dash-text-muted)] rounded-lg whitespace-pre-wrap font-mono">
          <strong className="font-sans">Worked solution:</strong>
          {"\n"}
          {q.workedSolution}
        </div>
      )}
    </div>
  );
}

// ── Question set card inside a subject folder ───────────────────────────────

function SetCard({
  set,
  onOpen,
  onEdit,
  onDelete,
  onUseInAssessment,
  onAddToLibrary,
}: {
  set: QuestionSet;
  onOpen: (set: QuestionSet) => void;
  onEdit: (set: QuestionSet) => void;
  onDelete: (set: QuestionSet) => void;
  onUseInAssessment: (set: QuestionSet) => void;
  onAddToLibrary: (set: QuestionSet) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalPoints = set.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="border border-[var(--dash-border)] rounded-xl p-4 space-y-3 hover:border-[var(--dash-primary)]/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--dash-primary)] shrink-0" />
            <p className="font-semibold text-[var(--dash-text)] truncate">
              {set.title}
            </p>
            {set.aiGenerated && (
              <Badge variant="warning">
                <Wand2 className="w-3 h-3 mr-1" /> AI
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {set.difficulty && (
              <Badge variant="outline">
                {DIFFICULTY_LABEL[set.difficulty] ?? set.difficulty}
              </Badge>
            )}
            {set.format && <Badge variant="outline">{set.format}</Badge>}
            {set.topic && <Badge variant="info">{set.topic}</Badge>}
            {set.skill && <Badge variant="info">{set.skill}</Badge>}
          </div>
          <p className="text-xs text-[var(--dash-text-faint)] mt-1.5">
            {set.questionCount} questions · {totalPoints} pts ·{" "}
            {formatDate(set.createdAt)}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onUseInAssessment(set)}
            title="Use in a new assessment"
            className="p-1.5 text-gray-400 hover:text-[var(--dash-primary)] text-xs font-medium"
          >
            Use
          </button>
          <button
            onClick={() => onAddToLibrary(set)}
            title="Copy every question into the main library"
            className="p-1.5 text-gray-400 hover:text-emerald-600"
          >
            <Library className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(set)}
            title="Edit set"
            className="p-1.5 text-gray-400 hover:text-[var(--dash-primary)]"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            title="Preview questions"
            className="p-1.5 text-gray-400 hover:text-[var(--dash-primary)]"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(set)}
            title="Delete set"
            className="p-1.5 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--dash-border)] pt-3 space-y-2">
          {set.questions.slice(0, 5).map((q, i) => (
            <div key={q.id} className="flex items-start gap-2">
              <span className="w-5 h-5 bg-gray-100 text-[var(--dash-text-muted)] text-[10px] font-bold flex items-center justify-center shrink-0 rounded">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <HtmlContent
                  html={q.text}
                  compact
                  className="text-xs text-[var(--dash-text-muted)]"
                />
              </div>
            </div>
          ))}
          {set.questions.length > 5 && (
            <button
              onClick={() => onOpen(set)}
              className="text-xs font-medium text-[var(--dash-primary)]"
            >
              View all {set.questions.length} questions →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Subject folder (bridgitus-style) ────────────────────────────────────────

function SubjectFolder({
  subject,
  sets,
  questions,
  defaultOpen,
  children,
}: {
  subject: string;
  sets: QuestionSet[];
  questions: Question[];
  defaultOpen?: boolean;
  children: (subject: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const totalQ = sets.reduce((s, qs) => s + qs.questionCount, 0);

  return (
    <div className="border border-[var(--dash-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-[var(--dash-surface)] transition-colors text-left"
      >
        {open ? (
          <FolderOpen className="w-5 h-5 text-amber-500 shrink-0" />
        ) : (
          <Folder className="w-5 h-5 text-amber-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--dash-text)] truncate">
            {subject}
          </p>
          <p className="text-xs text-[var(--dash-text-faint)] mt-0.5">
            {sets.length} set{sets.length !== 1 ? "s" : ""} ·{" "}
            {totalQ + questions.length} question
            {totalQ + questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs bg-[var(--dash-primary)]/10 text-[var(--dash-primary)] font-semibold px-2 py-0.5 rounded">
            {totalQ + questions.length}
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-[var(--dash-surface)] border-t border-[var(--dash-border)]">
          {children(subject)}
        </div>
      )}
    </div>
  );
}

// ── Post-generation / import options ────────────────────────────────────────

function AssignBlock({
  saveAsSet,
  alsoSaveToLibrary,
  assignAsAssessment,
  assessmentKind,
  assessmentTitle,
  maxAttempts,
  students,
  selectedIds,
  classFilter,
  onChange,
}: {
  saveAsSet: boolean;
  alsoSaveToLibrary: boolean;
  assignAsAssessment: boolean;
  assessmentKind: AssessmentKind;
  assessmentTitle: string;
  maxAttempts: number;
  students: UserProfile[];
  selectedIds: string[];
  classFilter?: string;
  onChange: (p: {
    saveAsSet?: boolean;
    alsoSaveToLibrary?: boolean;
    assignAsAssessment?: boolean;
    assessmentKind?: AssessmentKind;
    assessmentTitle?: string;
    maxAttempts?: number;
    selectedIds?: string[];
  }) => void;
}) {
  return (
    <div className="border border-[var(--dash-border)] rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium">What to do with these questions</p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={saveAsSet}
          onChange={(e) => onChange({ saveAsSet: e.target.checked })}
        />
        Save as a question set in the subject folder
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={alsoSaveToLibrary}
          onChange={(e) => onChange({ alsoSaveToLibrary: e.target.checked })}
        />
        Also add each question to the main library
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={assignAsAssessment}
          onChange={(e) => onChange({ assignAsAssessment: e.target.checked })}
        />
        Publish as a test/quiz/exam and assign to students
      </label>
      {assignAsAssessment && (
        <div className="space-y-3 pl-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select
                value={assessmentKind}
                onChange={(e) =>
                  onChange({ assessmentKind: e.target.value as AssessmentKind })
                }
                className={inputClass}
              >
                <option value="quiz">Quiz</option>
                <option value="test">Test</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Trials allowed
              </label>
              <input
                type="number"
                min={0}
                value={maxAttempts}
                onChange={(e) =>
                  onChange({ maxAttempts: Number(e.target.value) })
                }
                className={inputClass}
                title="0 = unlimited attempts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                value={assessmentTitle}
                onChange={(e) => onChange({ assessmentTitle: e.target.value })}
                className={inputClass}
                placeholder="Algebra quiz"
              />
            </div>
          </div>
          <p className="text-xs text-[var(--dash-text-muted)]">
            Pick one student or several. Leave none selected to assign to the
            whole class. 0 trials = unlimited retakes.
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

// ── Main workspace (shared by teacher and admin routes) ─────────────────────

export default function QuestionsWorkspace({
  for: who,
}: {
  for: "teacher" | "admin";
}) {
  const scope = who === "admin" ? "all" : "own";
  const base = who === "admin" ? "/dashboard/admin" : "/dashboard/teacher";
  const { profile, institution, refresh } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"folders" | "flat">("folders");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ type: "all", difficulty: "all" });

  // single-question modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [formError, setFormError] = useState("");

  // set detail / edit
  const [viewingSet, setViewingSet] = useState<QuestionSet | null>(null);
  const [editingSet, setEditingSet] = useState<QuestionSet | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [addToLibraryBusy, setAddToLibraryBusy] = useState(false);

  // AI generator
  const [aiOpen, setAiOpen] = useState(false);
  const [ai, setAi] = useState({
    subject: "",
    className: "",
    topic: "",
    skill: "",
    count: 10,
    type: "mcq" as "mcq" | "truefalse" | "short" | "essay" | "coding" | "mixed",
    difficulty: "medium" as QuestionDifficulty,
    context: "Exam-style",
    extraPrompt: "",
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiProgress, setAiProgress] = useState("");
  const [preview, setPreview] = useState<Question[]>([]);

  // manual set builder
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderMeta, setBuilderMeta] = useState({
    title: "",
    subject: "",
    className: "",
    topic: "",
    skill: "",
    difficulty: "medium" as QuestionDifficulty,
  });
  const [builderForms, setBuilderForms] = useState<FormState[]>([]);

  // post-generation / import options
  const [assignOpts, setAssignOpts] = useState({
    saveAsSet: true,
    alsoSaveToLibrary: false,
    assignAsAssessment: false,
    assessmentKind: "quiz" as AssessmentKind,
    assessmentTitle: "",
    maxAttempts: 1,
    selectedIds: [] as string[],
  });

  // CSV import
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Question[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvSaving, setCsvSaving] = useState(false);

  const subjects = institution?.subjects ?? profile?.subjects ?? [];
  const classes = institution?.classes ?? profile?.classes ?? [];
  const classLabel = institution?.classLabel ?? "Class";

  const reload = async () => {
    if (!institution || !profile) return;
    // Admins see the whole institution's bank; teachers see their own + shared.
    const owner = scope === "all" ? undefined : profile.uid;
    const [q, s] = await Promise.all([
      listQuestions(institution.id, owner),
      listQuestionSets(institution.id, owner),
    ]);
    setQuestions(q);
    setSets(s);
  };

  useEffect(() => {
    if (!institution || !profile) return;
    reload().finally(() => setLoading(false));
    listUsers(institution.id, "student").then(setStudents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution, profile]);

  // folder grouping: every known subject gets a folder, plus any subject found on data
  const subjectFolders = useMemo(() => {
    const map = new Map<
      string,
      { sets: QuestionSet[]; questions: Question[] }
    >();
    const ensure = (s: string) => {
      const key = s || "Uncategorised";
      if (!map.has(key)) map.set(key, { sets: [], questions: [] });
      return map.get(key)!;
    };
    for (const s of subjects) ensure(s);
    const q = search.toLowerCase();
    const matches = (hay: string) => !q || hay.toLowerCase().includes(q);
    for (const set of sets) {
      if (filter.difficulty !== "all" && set.difficulty !== filter.difficulty)
        continue;
      if (
        !matches(
          `${set.title} ${set.topic ?? ""} ${set.skill ?? ""} ${set.subject}`,
        )
      )
        continue;
      ensure(set.subject).sets.push(set);
    }
    for (const question of questions) {
      if (filter.type !== "all" && question.type !== filter.type) continue;
      if (
        filter.difficulty !== "all" &&
        question.difficulty !== filter.difficulty
      )
        continue;
      if (
        !matches(
          `${question.text} ${question.topic ?? ""} ${question.skill ?? ""} ${question.subject}`,
        )
      )
        continue;
      ensure(question.subject).questions.push(question);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [subjects, sets, questions, search, filter]);

  const resetAssign = () =>
    setAssignOpts({
      saveAsSet: true,
      alsoSaveToLibrary: false,
      assignAsAssessment: false,
      assessmentKind: "quiz",
      assessmentTitle: "",
      maxAttempts: 1,
      selectedIds: [],
    });

  const assignPatch = (p: Partial<typeof assignOpts>) =>
    setAssignOpts((prev) => ({ ...prev, ...p }));

  const publishAssessment = async (
    qs: Question[],
    kind: AssessmentKind,
    title: string,
    maxAttempts: number,
  ) => {
    if (!institution || !profile || !qs.length) return;
    const totalPoints = qs.reduce((s, q) => q.points + s, 0);
    await saveAssessment({
      id: newId(COL.assessments),
      institutionId: institution.id,
      teacherId: profile.uid,
      teacherName: profile.name,
      title: title.trim() || `${qs[0].subject || "AI"} ${kind}`,
      kind,
      subject: qs[0].subject,
      className: qs[0].className,
      questions: qs,
      durationMins: Math.max(10, qs.length * 2),
      totalPoints,
      passPercent: 50,
      shuffleQuestions: true,
      allowRetake: true,
      maxAttempts: Math.max(0, maxAttempts),
      showResultsImmediately: true,
      assignedStudentIds: assignOpts.selectedIds.length
        ? assignOpts.selectedIds
        : undefined,
      status: "published",
      createdAt: Date.now(),
    });
  };

  const importQuestions = async (qs: Question[], titleHint: string) => {
    if (
      !assignOpts.saveAsSet &&
      !assignOpts.alsoSaveToLibrary &&
      !assignOpts.assignAsAssessment
    ) {
      throw new Error(
        "Choose where to save the questions (set, library, or assignment).",
      );
    }
    if (assignOpts.saveAsSet) {
      if (!institution || !profile) throw new Error("Sign in again.");
      await saveQuestionSet({
        id: newId(COL.questionSets),
        institutionId: institution.id,
        teacherId: profile.uid,
        teacherName: profile.name,
        title: assignOpts.assessmentTitle.trim() || titleHint,
        subject: qs[0].subject,
        className: qs[0].className,
        topic: qs[0].topic,
        skill: qs[0].skill,
        difficulty: qs[0].difficulty,
        format: qs.every((q) => q.type === qs[0].type)
          ? TYPE_LABEL[qs[0].type]
          : "Mixed",
        questions: qs,
        questionCount: qs.length,
        aiGenerated: qs.some((q) => q.aiGenerated),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    if (assignOpts.alsoSaveToLibrary) {
      await Promise.all(qs.map((q) => saveQuestion(q)));
    }
    if (assignOpts.assignAsAssessment) {
      await publishAssessment(
        qs,
        assignOpts.assessmentKind,
        assignOpts.assessmentTitle || titleHint,
        assignOpts.maxAttempts,
      );
    }
  };

  // ── single question save ──
  const save = async () => {
    if (!institution || !profile) return;
    if (isEmptyHtml(form.text)) {
      setFormError("Question text is required.");
      return;
    }
    setFormError("");
    setSavingQuestion(true);
    try {
      await saveQuestion(
        toQuestion(form, {
          institutionId: institution.id,
          teacherId: profile.uid,
        }),
      );
      setOpen(false);
      setForm(emptyForm);
      await reload();
    } finally {
      setSavingQuestion(false);
    }
  };

  // ── AI generation ──
  const generate = async () => {
    setAiError("");
    if (!institution?.id) {
      setAiError("No institution is loaded — refresh the page and try again.");
      return;
    }
    if (!ai.subject.trim()) {
      setAiError("Choose or type a subject before generating.");
      return;
    }
    if (!ai.type) {
      setAiError("Pick a question type.");
      return;
    }
    if (!ai.count || ai.count < 1) {
      setAiError("Enter how many questions you want (1–100).");
      return;
    }
    const plan = getPlan(institution.plan);
    const allowed = planAllows(plan, { aiUsed: institution.aiGenerationsUsed });
    if (!allowed.ai) {
      setAiError(
        `You've used all ${plan.aiGenerationsPerMonth} AI generations on the ${plan.name} plan this cycle.`,
      );
      return;
    }
    setAiLoading(true);
    setAiProgress("Generating…");
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ai,
          institutionId: institution.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiProgress(
        `Grading ${data.batches ?? 1} batch${data.batches === 1 ? "" : "es"}…`,
      );
      await incrementAiUsage(institution.id);
      await refresh();
      const mapped: Question[] = (
        data.questions as Record<string, unknown>[]
      ).map((raw) => ({
        id: newId(COL.questions),
        institutionId: institution.id,
        teacherId: profile!.uid,
        subject: ai.subject,
        className: ai.className,
        topic: ai.topic || undefined,
        skill: ai.skill || undefined,
        difficulty: ai.difficulty,
        type: (raw.type as QuestionType) ?? ai.type,
        text: String(raw.text ?? ""),
        points: Number(raw.points ?? 1),
        explanation: raw.explanation ? String(raw.explanation) : undefined,
        workedSolution: raw.workedSolution
          ? String(raw.workedSolution)
          : undefined,
        options: raw.options as string[] | undefined,
        correctIndex: raw.correctIndex as number | undefined,
        correctBool: raw.correctBool as boolean | undefined,
        acceptedAnswers: raw.acceptedAnswers as string[] | undefined,
        language:
          (raw.language as Question["language"]) ??
          (ai.type === "coding" ? "javascript" : undefined),
        starterCode: raw.starterCode as string | undefined,
        testCases: raw.testCases as Question["testCases"],
        aiGenerated: true,
        createdAt: Date.now(),
      }));
      setPreview(mapped);
      setAssignOpts((prev) => ({
        ...prev,
        assessmentTitle: `${ai.subject || "AI"} ${ai.topic ? `— ${ai.topic}` : ""} ${
          prev.assessmentKind
        }`,
      }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
      setAiProgress("");
    }
  };

  const savePreview = async () => {
    setAiError("");
    try {
      await importQuestions(
        preview,
        `${ai.subject || "AI"} set${ai.topic ? ` — ${ai.topic}` : ""}`,
      );
      setPreview([]);
      setAiOpen(false);
      resetAssign();
      await reload();
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Couldn't save questions.");
    }
  };

  // ── manual set builder ──
  const openBuilder = () => {
    setBuilderMeta({
      title: "",
      subject: subjects[0] ?? "",
      className: classes[0] ?? "",
      topic: "",
      skill: "",
      difficulty: "medium",
    });
    setBuilderForms([
      { ...emptyForm, subject: subjects[0] ?? "", className: classes[0] ?? "" },
    ]);
    setBuilderOpen(true);
  };

  const addBuilderQuestion = () => {
    if (builderForms.length >= MAX_QUESTIONS_PER_SET) return;
    setBuilderForms((prev) => [
      ...prev,
      {
        ...emptyForm,
        subject: builderMeta.subject,
        className: builderMeta.className,
        topic: builderMeta.topic,
        skill: builderMeta.skill,
        difficulty: builderMeta.difficulty,
      },
    ]);
  };

  const saveBuilderSet = async () => {
    if (!institution || !profile) return;
    setFormError("");
    const valid = builderForms.filter((f) => !isEmptyHtml(f.text));
    if (!builderMeta.title.trim() || !builderMeta.subject) {
      setFormError("Set title and subject are required.");
      return;
    }
    if (!valid.length) {
      setFormError("Add at least one question with text.");
      return;
    }
    setEditSaving(true);
    try {
      const qs = valid.map((f) =>
        toQuestion(f, {
          institutionId: institution.id,
          teacherId: profile.uid,
          id: newId(COL.questions),
        }),
      );
      await saveQuestionSet({
        id: newId(COL.questionSets),
        institutionId: institution.id,
        teacherId: profile.uid,
        teacherName: profile.name,
        title: builderMeta.title.trim(),
        subject: builderMeta.subject,
        className: builderMeta.className,
        topic: builderMeta.topic || undefined,
        skill: builderMeta.skill || undefined,
        difficulty: builderMeta.difficulty,
        format: qs.every((q) => q.type === qs[0].type)
          ? TYPE_LABEL[qs[0].type]
          : "Mixed",
        questions: qs,
        questionCount: qs.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setBuilderOpen(false);
      await reload();
    } catch {
      setFormError("Couldn't save the set.");
    } finally {
      setEditSaving(false);
    }
  };

  // ── set actions ──
  const launchSetInAssessment = (set: QuestionSet) => {
    sessionStorage.setItem(
      "assessmentPrefill",
      JSON.stringify({
        title: set.title,
        subject: set.subject,
        className: set.className,
        questionIds: set.questions.map((q) => q.id),
        questions: set.questions,
      }),
    );
    router.push(`${base}/assessments/new`);
  };

  const addSetToLibrary = async (set: QuestionSet) => {
    if (!institution || !profile) return;
    setAddToLibraryBusy(true);
    try {
      await Promise.all(
        set.questions.map((q) =>
          saveQuestion({
            ...q,
            id: newId(COL.questions),
            teacherId: profile.uid,
            createdAt: Date.now(),
          }),
        ),
      );
      await reload();
    } finally {
      setAddToLibraryBusy(false);
    }
  };

  const saveSetEdits = async () => {
    if (!editingSet?.id) return;
    setEditSaving(true);
    try {
      const payload = {
        title: editingSet.title,
        subject: editingSet.subject,
        topic: editingSet.topic,
        skill: editingSet.skill,
        difficulty: editingSet.difficulty,
        questions: editingSet.questions,
        questionCount: editingSet.questions.length,
        updatedAt: Date.now(),
      };
      await updateQuestionSet(editingSet.id, payload);
      setSets((prev) =>
        prev.map((s) => (s.id === editingSet.id ? { ...s, ...payload } : s)),
      );
      setEditingSet(null);
      if (viewingSet?.id === editingSet.id) {
        setViewingSet({ ...editingSet, ...payload });
      }
    } finally {
      setEditSaving(false);
    }
  };

  // ── CSV import ──
  const handleCsvFile = async (file: File) => {
    if (!institution || !profile) return;
    const text = await file.text();
    const { questions: qs, errors } = parseQuestionCsv(text, {
      institutionId: institution.id,
      teacherId: profile.uid,
      newId: () => newId(COL.questions),
      defaults: {
        subject: subjects[0] ?? "",
        className: classes[0] ?? "",
      },
    });
    setCsvErrors(errors);
    setCsvPreview(qs);
    if (qs.length === 1) {
      setForm(questionToForm(qs[0]));
    }
  };

  const saveCsv = async () => {
    setCsvSaving(true);
    try {
      await importQuestions(csvPreview, "Imported set");
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

  // ── set detail view ──
  if (viewingSet) {
    return (
      <DashboardShell
        role="teacher"
        allowRoles={
          profile?.role === "admin" && who === "admin"
            ? ["teacher", "admin"]
            : ["teacher"]
        }
        navItems={profile?.role === "admin" ? adminNav : teacherNav}
        title={viewingSet.title}
        subtitle={`${viewingSet.subject} · ${viewingSet.questionCount} questions`}
      >
        <div className="space-y-6">
          <button
            onClick={() => setViewingSet(null)}
            className="text-sm text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
          >
            ← Back to question bank
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Folder className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-[var(--dash-text-muted)]">
                  {viewingSet.subject}
                </span>
              </div>
              <h1 className="text-xl font-bold text-[var(--dash-text)]">
                {viewingSet.title}
              </h1>
              <p className="text-sm text-[var(--dash-text-muted)] mt-1">
                {viewingSet.className}
                {viewingSet.topic ? ` · ${viewingSet.topic}` : ""}
                {viewingSet.skill ? ` · ${viewingSet.skill}` : ""}
                {viewingSet.difficulty
                  ? ` · ${DIFFICULTY_LABEL[viewingSet.difficulty] ?? viewingSet.difficulty}`
                  : ""}
                {viewingSet.format ? ` · ${viewingSet.format}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => launchSetInAssessment(viewingSet)}
              >
                Use in assessment
              </Button>
              <Button
                variant="outline"
                loading={addToLibraryBusy}
                onClick={() => void addSetToLibrary(viewingSet)}
              >
                <Library className="w-4 h-4" /> Add all to library
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingSet({ ...viewingSet })}
              >
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: "Questions", value: viewingSet.questionCount },
              {
                label: "Total points",
                value: viewingSet.questions.reduce((s, q) => s + q.points, 0),
              },
              {
                label: "Difficulty",
                value: viewingSet.difficulty
                  ? (DIFFICULTY_LABEL[viewingSet.difficulty] ??
                    viewingSet.difficulty)
                  : "—",
              },
              { label: "Format", value: viewingSet.format ?? "Mixed" },
            ].map((s) => (
              <Card key={s.label}>
                <CardBody className="py-4">
                  <p className="text-xl font-bold text-[var(--dash-text)]">
                    {s.value}
                  </p>
                  <p className="text-xs text-[var(--dash-text-muted)]">
                    {s.label}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {viewingSet.questions.map((q, i) => (
              <QuestionReviewCard key={q.id} q={q} index={i} />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const allSubjects = Array.from(
    new Set([
      ...subjects,
      ...sets.map((s) => s.subject),
      ...questions.map((q) => q.subject),
    ]),
  ).filter(Boolean);

  return (
    <DashboardShell
      role="teacher"
      allowRoles={
        profile?.role === "admin" && who === "admin"
          ? ["teacher", "admin"]
          : ["teacher"]
      }
      navItems={profile?.role === "admin" ? adminNav : teacherNav}
      title="Question bank"
      subtitle="Subject folders with question sets — add or generate up to 100 questions per set"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and sets…"
            className={`${inputClass} w-auto flex-1 min-w-44`}
          />
          <select
            value={filter.difficulty}
            onChange={(e) =>
              setFilter({ ...filter, difficulty: e.target.value })
            }
            className={`${inputClass} w-auto`}
          >
            <option value="all">All difficulties</option>
            {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
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
          <div className="flex gap-1 bg-gray-100 dark:bg-[var(--dash-surface)] p-1 rounded-lg">
            <button
              onClick={() => setView("folders")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                view === "folders"
                  ? "bg-white text-[var(--dash-text)] border border-[var(--dash-border)] shadow-sm"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              <Folder className="w-3.5 h-3.5" /> Folders
            </button>
            <button
              onClick={() => setView("flat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                view === "flat"
                  ? "bg-white text-[var(--dash-text)] border border-[var(--dash-border)] shadow-sm"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              <List className="w-3.5 h-3.5" /> All
            </button>
          </div>
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </Button>
          <Button variant="outline" onClick={openBuilder}>
            <Layers className="w-4 h-4" /> New set
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

        {loading ? (
          <Card>
            <CardBody className="p-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-50 animate-pulse rounded-lg"
                />
              ))}
            </CardBody>
          </Card>
        ) : subjectFolders.length === 0 ? (
          <Card>
            <CardBody className="p-0">
              <EmptyState
                icon={<Library className="w-6 h-6" />}
                title="Your question bank is empty"
                description="Add questions manually, build a set of up to 100 questions, or generate them with Gemini."
              />
            </CardBody>
          </Card>
        ) : view === "folders" ? (
          <div className="space-y-3">
            {subjectFolders.map(([subject, data], idx) => (
              <SubjectFolder
                key={subject}
                subject={subject}
                sets={data.sets}
                questions={data.questions}
                defaultOpen={idx === 0}
              >
                {() => (
                  <>
                    {data.sets.map((set) => (
                      <SetCard
                        key={set.id}
                        set={set}
                        onOpen={setViewingSet}
                        onEdit={(s) => setEditingSet({ ...s })}
                        onDelete={async (s) => {
                          if (
                            !confirm(
                              `Delete "${s.title}"? This cannot be undone.`,
                            )
                          )
                            return;
                          await deleteQuestionSet(s.id);
                          await reload();
                        }}
                        onUseInAssessment={launchSetInAssessment}
                        onAddToLibrary={(s) => void addSetToLibrary(s)}
                      />
                    ))}
                    {data.questions.length > 0 && (
                      <div className="border border-[var(--dash-border)] rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Library className="w-4 h-4 text-[var(--dash-text-muted)]" />
                          <p className="text-sm font-medium">
                            Loose questions ({data.questions.length})
                          </p>
                          <span className="text-xs text-[var(--dash-text-faint)]">
                            not in any set
                          </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {data.questions.map((q) => (
                            <div key={q.id} className="py-3 flex gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge>{TYPE_LABEL[q.type]}</Badge>
                                  {q.difficulty && (
                                    <Badge variant="outline">
                                      {DIFFICULTY_LABEL[q.difficulty] ??
                                        q.difficulty}
                                    </Badge>
                                  )}
                                  {q.topic && (
                                    <Badge variant="info">{q.topic}</Badge>
                                  )}
                                  {q.aiGenerated && (
                                    <Badge variant="warning">
                                      <Wand2 className="w-3 h-3 mr-1" /> AI
                                    </Badge>
                                  )}
                                  <span className="text-xs text-[var(--dash-text-faint)]">
                                    {q.points} pts
                                  </span>
                                </div>
                                <HtmlContent
                                  html={q.text}
                                  compact
                                  className="text-sm text-[var(--dash-text)]"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(q.createdAt)}
                                </p>
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
                      </div>
                    )}
                  </>
                )}
              </SubjectFolder>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">
                {questions.length +
                  sets.reduce((s, x) => s + x.questionCount, 0)}{" "}
                items across {allSubjects.length} subjects
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
                {subjectFolders.flatMap(([subject, data]) => [
                  ...data.sets.map((set) => (
                    <button
                      key={`set-${set.id}`}
                      onClick={() => setViewingSet(set)}
                      className="w-full text-left px-6 py-4 flex gap-4 hover:bg-gray-50"
                    >
                      <Layers className="w-4 h-4 mt-1 text-[var(--dash-primary)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="info">{subject}</Badge>
                          {set.difficulty && (
                            <Badge variant="outline">
                              {DIFFICULTY_LABEL[set.difficulty] ??
                                set.difficulty}
                            </Badge>
                          )}
                          <span className="text-xs text-[var(--dash-text-faint)]">
                            {set.questionCount} questions
                          </span>
                          {set.aiGenerated && (
                            <Badge variant="warning">
                              <Wand2 className="w-3 h-3 mr-1" /> AI
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{set.title}</p>
                      </div>
                    </button>
                  )),
                  ...data.questions.map((q) => (
                    <div key={`q-${q.id}`} className="px-6 py-4 flex gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="info">{subject}</Badge>
                          <Badge>{TYPE_LABEL[q.type]}</Badge>
                          <span className="text-xs text-[var(--dash-text-faint)]">
                            {q.points} pts
                          </span>
                        </div>
                        <HtmlContent
                          html={q.text}
                          compact
                          className="text-sm text-[var(--dash-text)]"
                        />
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
                  )),
                ])}
              </div>
            </CardBody>
          </Card>
        )}
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
            <Button loading={savingQuestion} onClick={() => void save()}>
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
          classLabel={classLabel}
        />
      </Modal>

      {/* ── AI generator ── */}
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
                Discard & regenerate
              </Button>
              <Button onClick={() => void savePreview()}>
                {assignOpts.assignAsAssessment
                  ? `Save & assign (${preview.length})`
                  : `Save ${preview.length} question${preview.length === 1 ? "" : "s"}`}
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
        {aiProgress && (
          <p className="text-sm text-[var(--dash-text-muted)] mb-3">
            {aiProgress}
          </p>
        )}
        {preview.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--dash-text-muted)]">
              Generate up to {MAX_QUESTIONS_PER_SET} questions per run — filed
              into subject folders as sets, with worked solutions for every
              question. Counts as 1 generation against your plan (
              {institution?.aiGenerationsUsed ?? 0} used this cycle).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Subject
                </label>
                {subjects.length ? (
                  <select
                    value={ai.subject}
                    onChange={(e) => setAi({ ...ai, subject: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={ai.subject}
                    onChange={(e) => setAi({ ...ai, subject: e.target.value })}
                    className={inputClass}
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {classLabel}
                </label>
                {classes.length ? (
                  <select
                    value={ai.className}
                    onChange={(e) =>
                      setAi({ ...ai, className: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {classes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={ai.className}
                    onChange={(e) =>
                      setAi({ ...ai, className: e.target.value })
                    }
                    className={inputClass}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Topic
                </label>
                <input
                  value={ai.topic}
                  onChange={(e) => setAi({ ...ai, topic: e.target.value })}
                  className={inputClass}
                  placeholder="Quadratic equations"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Skill (optional)
                </label>
                <input
                  value={ai.skill}
                  onChange={(e) => setAi({ ...ai, skill: e.target.value })}
                  className={inputClass}
                  placeholder="Problem solving"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Question type
                </label>
                <select
                  value={ai.type}
                  onChange={(e) =>
                    setAi({
                      ...ai,
                      type: e.target.value as typeof ai.type,
                    })
                  }
                  className={inputClass}
                >
                  <option value="mcq">Multiple choice</option>
                  <option value="truefalse">True / False</option>
                  <option value="short">Short answer</option>
                  <option value="essay">Essay</option>
                  <option value="coding">Coding</option>
                  <option value="mixed">Mixed types</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Difficulty
                </label>
                <select
                  value={ai.difficulty}
                  onChange={(e) =>
                    setAi({
                      ...ai,
                      difficulty: e.target.value as QuestionDifficulty,
                    })
                  }
                  className={inputClass}
                >
                  <option value="easy">Easy / Support</option>
                  <option value="medium">Medium / Core</option>
                  <option value="hard">Hard / Extension</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Count (up to {MAX_QUESTIONS_PER_SET})
                </label>
                <input
                  type="number"
                  min={1}
                  max={MAX_QUESTIONS_PER_SET}
                  value={ai.count}
                  onChange={(e) =>
                    setAi({
                      ...ai,
                      count: Math.min(
                        MAX_QUESTIONS_PER_SET,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Context
                </label>
                <select
                  value={ai.context}
                  onChange={(e) => setAi({ ...ai, context: e.target.value })}
                  className={inputClass}
                >
                  <option value="Exam-style">Exam-style</option>
                  <option value="Real-life">Real-life scenarios</option>
                  <option value="Problem-solving">Problem-solving</option>
                  <option value="Abstract">Abstract / concept-focused</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Extra instructions (optional)
              </label>
              <textarea
                rows={3}
                value={ai.extraPrompt}
                onChange={(e) => setAi({ ...ai, extraPrompt: e.target.value })}
                className={inputClass}
                placeholder="e.g. focus on worded problems, include diagrams descriptions…"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--dash-text-muted)]">
              {preview.length} question{preview.length === 1 ? "" : "s"}{" "}
              generated. Review them below, then choose where they go.
            </p>
            <div className="max-h-[45vh] overflow-y-auto space-y-3 pr-1">
              {preview.map((q, i) => (
                <QuestionReviewCard key={q.id} q={q} index={i} />
              ))}
            </div>
            <AssignBlock
              saveAsSet={assignOpts.saveAsSet}
              alsoSaveToLibrary={assignOpts.alsoSaveToLibrary}
              assignAsAssessment={assignOpts.assignAsAssessment}
              assessmentKind={assignOpts.assessmentKind}
              assessmentTitle={assignOpts.assessmentTitle}
              maxAttempts={assignOpts.maxAttempts}
              students={students}
              selectedIds={assignOpts.selectedIds}
              classFilter={ai.className || undefined}
              onChange={assignPatch}
            />
          </div>
        )}
      </Modal>

      {/* ── Manual set builder ── */}
      <Modal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="New question set"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setBuilderOpen(false)}>
              Cancel
            </Button>
            <Button loading={editSaving} onClick={() => void saveBuilderSet()}>
              Save set (
              {builderForms.filter((f) => !isEmptyHtml(f.text)).length})
            </Button>
          </>
        }
      >
        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Set title
              </label>
              <input
                value={builderMeta.title}
                onChange={(e) =>
                  setBuilderMeta({ ...builderMeta, title: e.target.value })
                }
                className={inputClass}
                placeholder="Algebra — end of term"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Subject (folder)
              </label>
              {subjects.length ? (
                <select
                  value={builderMeta.subject}
                  onChange={(e) =>
                    setBuilderMeta({ ...builderMeta, subject: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={builderMeta.subject}
                  onChange={(e) =>
                    setBuilderMeta({ ...builderMeta, subject: e.target.value })
                  }
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {classLabel}
              </label>
              {classes.length ? (
                <select
                  value={builderMeta.className}
                  onChange={(e) =>
                    setBuilderMeta({
                      ...builderMeta,
                      className: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {classes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={builderMeta.className}
                  onChange={(e) =>
                    setBuilderMeta({
                      ...builderMeta,
                      className: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Difficulty
              </label>
              <select
                value={builderMeta.difficulty}
                onChange={(e) =>
                  setBuilderMeta({
                    ...builderMeta,
                    difficulty: e.target.value as QuestionDifficulty,
                  })
                }
                className={inputClass}
              >
                {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Topic</label>
              <input
                value={builderMeta.topic}
                onChange={(e) =>
                  setBuilderMeta({ ...builderMeta, topic: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Skill</label>
              <input
                value={builderMeta.skill}
                onChange={(e) =>
                  setBuilderMeta({ ...builderMeta, skill: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Questions ({builderForms.length}/{MAX_QUESTIONS_PER_SET})
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={addBuilderQuestion}
              disabled={builderForms.length >= MAX_QUESTIONS_PER_SET}
            >
              <Plus className="w-4 h-4" /> Add question
            </Button>
          </div>

          <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
            {builderForms.map((f, i) => (
              <div
                key={i}
                className="border border-[var(--dash-border)] rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Question {i + 1}</p>
                  {builderForms.length > 1 && (
                    <button
                      className="text-xs text-red-600"
                      onClick={() =>
                        setBuilderForms((prev) =>
                          prev.filter((_, j) => j !== i),
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
                <QuestionFields
                  form={f}
                  setForm={(nf) =>
                    setBuilderForms((prev) =>
                      prev.map((x, j) => (j === i ? nf : x)),
                    )
                  }
                  subjects={
                    subjects.length
                      ? subjects
                      : [builderMeta.subject].filter(Boolean)
                  }
                  classes={
                    classes.length
                      ? classes
                      : [builderMeta.className].filter(Boolean)
                  }
                  classLabel={classLabel}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Edit set ── */}
      <Modal
        open={!!editingSet}
        onClose={() => setEditingSet(null)}
        title="Edit question set"
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingSet(null)}>
              Cancel
            </Button>
            <Button loading={editSaving} onClick={() => void saveSetEdits()}>
              Save changes
            </Button>
          </>
        }
      >
        {editingSet && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  value={editingSet.title}
                  onChange={(e) =>
                    setEditingSet({ ...editingSet, title: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Subject (folder)
                </label>
                <input
                  value={editingSet.subject}
                  onChange={(e) =>
                    setEditingSet({ ...editingSet, subject: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Topic
                </label>
                <input
                  value={editingSet.topic ?? ""}
                  onChange={(e) =>
                    setEditingSet({ ...editingSet, topic: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Difficulty
                </label>
                <select
                  value={editingSet.difficulty ?? "medium"}
                  onChange={(e) =>
                    setEditingSet({
                      ...editingSet,
                      difficulty: e.target.value as QuestionDifficulty,
                    })
                  }
                  className={inputClass}
                >
                  {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-[var(--dash-text-muted)]">
              {editingSet.questions.length} questions ·{" "}
              {editingSet.questions.reduce((s, q) => s + q.points, 0)} pts. Use
              &quot;Add all to library&quot; on the set page to reuse individual
              questions elsewhere.
            </p>
          </div>
        )}
      </Modal>

      {/* ── CSV import ── */}
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
                Import {csvPreview.length} question
                {csvPreview.length === 1 ? "" : "s"}
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
            <p className="text-[var(--dash-text-muted)]">
              Upload a CSV and each row fills a question plus its options.
              Download the template so the columns match.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(
                  "exampro-questions-template.csv",
                  questionCsvTemplate(),
                )
              }
            >
              Download CSV template
            </Button>
            <div className="border border-[var(--dash-border)] rounded-xl bg-gray-50 p-4 text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-[var(--dash-text)]">
                Required columns
              </p>
              <p>
                <code>
                  type,text,option_a,option_b,option_c,option_d,correct,points,explanation,subject,class,topic,skill,difficulty
                </code>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>type</strong>: mcq, truefalse, short, essay, coding,
                  or project. Leave blank to treat rows with options as mcq.
                </li>
                <li>
                  <strong>text</strong>: the question stem (required).
                </li>
                <li>
                  <strong>correct</strong>: for MCQ use A/B/C/D, 1–4, or the
                  option text. For true/false use true or false. For short
                  answers, comma-separated accepted answers.
                </li>
                <li>
                  <strong>difficulty</strong>: easy, medium, hard, support,
                  core, or extension.
                </li>
              </ul>
              <p>
                Wrap cells that contain commas in double quotes. Example:{" "}
                <code>
                  mcq,&quot;What is 2 + 2?&quot;,3,4,5,6,B,1,,Mathematics,JSS
                  1,,,
                </code>
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
          <div className="space-y-4">
            {csvErrors.length > 0 && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 space-y-1 rounded-lg">
                {csvErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}
            <p className="text-sm text-[var(--dash-text-muted)]">
              {csvPreview.length} question{csvPreview.length === 1 ? "" : "s"}{" "}
              ready.
            </p>
            <div className="max-h-[40vh] overflow-y-auto space-y-3 pr-1">
              {csvPreview.map((q, i) => (
                <QuestionReviewCard key={q.id} q={q} index={i} />
              ))}
            </div>
            <AssignBlock
              saveAsSet={assignOpts.saveAsSet}
              alsoSaveToLibrary={assignOpts.alsoSaveToLibrary}
              assignAsAssessment={assignOpts.assignAsAssessment}
              assessmentKind={assignOpts.assessmentKind}
              assessmentTitle={assignOpts.assessmentTitle}
              maxAttempts={assignOpts.maxAttempts}
              students={students}
              selectedIds={assignOpts.selectedIds}
              classFilter={csvPreview[0]?.className}
              onChange={assignPatch}
            />
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
