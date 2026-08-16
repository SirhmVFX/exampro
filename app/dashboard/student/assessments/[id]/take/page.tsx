"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, Clock, Play } from "lucide-react";
import DashboardShell from "@/app/components/dashboard/shell";
import { studentNav } from "@/app/components/dashboard/nav";
import { Card, CardBody, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getAssessment,
  listAttemptsByStudent,
  listMaterialProgress,
  saveAttempt,
  updateAttempt,
  appendAttemptEvent,
  newId,
  COL,
} from "@/lib/db";
import { gradeAttempt, runJsTestCases } from "@/lib/grading";
import type { Assessment, Attempt, Question } from "@/lib/types";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { HtmlContent } from "@/app/components/ui/html-content";
import { WysiwygEditor } from "@/app/components/ui/wysiwyg-editor";
import {
  canTakeAssessment,
  completedMaterialIds,
  inputClass,
  KIND_LABEL,
} from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CodingPlayground({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const lang = q.language ?? "javascript";

  const run = async () => {
    setRunning(true);
    try {
      if (lang === "javascript" && q.testCases?.length) {
        const r = await runJsTestCases(value, q.testCases);
        setOutput(
          r.details.map((d, i) => `Test ${i + 1}: ${d}`)
        );
        setOutput((prev) => [
          ...prev,
          `${r.passed}/${r.total} passed`,
        ]);
      } else {
        setOutput(["This language is graded by your teacher after you submit."]);
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="info">{lang}</Badge>
        {(lang === "javascript" || lang === "html" || lang === "css") && (
          <Button type="button" size="sm" variant="outline" loading={running} onClick={() => void run()}>
            <Play className="w-3.5 h-3.5" /> Run
          </Button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        spellCheck={false}
        className={`${inputClass} font-mono text-xs leading-relaxed`}
      />
      {lang === "html" && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Live preview</p>
          <iframe
            title="preview"
            sandbox=""
            className="w-full h-48 border rounded-lg bg-white"
            srcDoc={value}
          />
        </div>
      )}
      {lang === "css" && (
        <iframe
          title="css-preview"
          sandbox=""
          className="w-full h-48 border rounded-lg bg-white"
          srcDoc={`<style>${value}</style><div class="box">Preview box</div>`}
        />
      )}
      {output.length > 0 && (
        <pre className="text-xs bg-gray-900 text-emerald-300 rounded-lg p-3 overflow-x-auto">
          {output.join("\n")}
        </pre>
      )}
      {q.testCases && q.testCases.length > 0 && lang === "javascript" && (
        <p className="text-xs text-gray-400">
          {q.testCases.length} hidden/visible test cases. Define <code>solve(...)</code>.
        </p>
      )}
    </div>
  );
}

function WebcamBanner({ attemptId }: { attemptId: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        if (attemptId) void appendAttemptEvent(attemptId, { type: "webcam_on", at: Date.now() });
      })
      .catch(() => {
        if (attemptId) {
          void appendAttemptEvent(attemptId, {
            type: "webcam_off",
            at: Date.now(),
            detail: "permission denied",
          });
        }
      });
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [attemptId]);
  return (
    <div className="flex items-center gap-3 border border-gray-200 p-3">
      <video ref={videoRef} autoPlay muted playsInline className="w-28 h-20 bg-black object-cover" />
      <p className="text-xs text-gray-500">
        Camera preview is on for this exam. Video is not uploaded — presence is logged.
      </p>
    </div>
  );
}

function ProjectAnswer({
  value,
  onChange,
}: {
  value: { githubUrl?: string; fileUrl?: string; notes?: string };
  onChange: (v: { githubUrl?: string; fileUrl?: string; notes?: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  return (
    <div className="space-y-3">
      <input
        placeholder="GitHub URL"
        value={value.githubUrl ?? ""}
        onChange={(e) => onChange({ ...value, githubUrl: e.target.value })}
        className={inputClass}
      />
      <WysiwygEditor
        content={value.notes ?? ""}
        onChange={(notes) => onChange({ ...value, notes })}
        placeholder="Notes / write-up"
        minHeight={120}
      />
      <label className="text-sm font-medium text-[var(--dash-primary)] cursor-pointer">
        {uploading ? "Uploading…" : value.fileUrl ? "Replace file" : "Upload file"}
        <input
          type="file"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              const r = await uploadToCloudinary(file, "exampro/projects");
              onChange({ ...value, fileUrl: r.url });
            } finally {
              setUploading(false);
            }
          }}
        />
      </label>
      {value.fileUrl && (
        <a href={value.fileUrl} className="text-xs underline" target="_blank" rel="noreferrer">
          Attached file
        </a>
      )}
    </div>
  );
}

export default function TakeAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, institution } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (!profile || !institution) return;
    (async () => {
      const a = await getAssessment(id);
      if (!a) {
        setError("Assessment not found.");
        return;
      }
      const [atts, prog] = await Promise.all([
        listAttemptsByStudent(institution.id, profile.uid),
        listMaterialProgress(institution.id, profile.uid),
      ]);
      const mine = atts.filter((x) => x.assessmentId === a.id);
      const inProgress = mine.find((x) => x.status === "in_progress");
      const gate = canTakeAssessment(a, mine, completedMaterialIds(prog), profile.uid);
      if (!inProgress && !gate.ok) {
        setError(gate.reason ?? "You can't take this assessment.");
        setAssessment(a);
        return;
      }
      const extra = profile.accommodations?.extraTimePercent ?? 0;
      const skip = new Set(profile.accommodations?.skipQuestionTypes ?? []);
      const visibleQs = (a.shuffleQuestions ? shuffle(a.questions) : a.questions).filter(
        (q) => !skip.has(q.type)
      );
      setQuestions(visibleQs);
      setAssessment(a);
      const durationMins =
        a.durationMins > 0 ? a.durationMins * (1 + extra / 100) : 0;
      if (inProgress) {
        setAttemptId(inProgress.id);
        setAttemptNumber(inProgress.attemptNumber);
        startedAt.current = inProgress.startedAt;
        const restored: Record<string, unknown> = {};
        for (const r of inProgress.perQuestion) restored[r.questionId] = r.answer;
        setAnswers(restored);
        void appendAttemptEvent(inProgress.id, { type: "resume", at: Date.now() });
        if (durationMins > 0) {
          const elapsed = Math.floor((Date.now() - inProgress.startedAt) / 1000);
          setSecondsLeft(Math.max(0, Math.round(durationMins * 60) - elapsed));
        }
      } else {
        const finished = mine.filter((x) => x.status !== "in_progress").length;
        const num = finished + 1;
        setAttemptNumber(num);
        const newAttemptId = newId(COL.attempts);
        setAttemptId(newAttemptId);
        startedAt.current = Date.now();
        const draft: Attempt = {
          id: newAttemptId,
          institutionId: institution.id,
          assessmentId: a.id,
          assessmentTitle: a.title,
          assessmentKind: a.kind,
          subject: a.subject,
          className: a.className,
          teacherId: a.teacherId,
          studentId: profile.uid,
          studentName: profile.name,
          attemptNumber: num,
          perQuestion: [],
          score: 0,
          maxScore: a.totalPoints,
          percent: 0,
          passed: false,
          needsManualGrading: false,
          status: "in_progress",
          startedAt: startedAt.current,
          extraTimePercent: extra || undefined,
          events: [{ type: "start", at: Date.now() }],
        };
        await saveAttempt(draft);
        if (durationMins > 0) setSecondsLeft(Math.round(durationMins * 60));
      }
    })();
  }, [id, profile, institution]);

  const submit = useCallback(async () => {
    if (!assessment || !profile || !institution || !attemptId || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const filled = { ...answersRef.current };
      for (const q of assessment.questions) {
        if (q.type === "coding" && filled[q.id] === undefined) {
          filled[q.id] = q.starterCode ?? "";
        }
      }
      const outcome = await gradeAttempt(assessment, filled);
      await updateAttempt(attemptId, {
        perQuestion: outcome.perQuestion,
        score: outcome.score,
        maxScore: outcome.maxScore,
        percent: outcome.percent,
        passed: outcome.passed,
        needsManualGrading: outcome.needsManualGrading,
        status: outcome.needsManualGrading ? "submitted" : "graded",
        submittedAt: Date.now(),
        timeTakenSecs: Math.floor((Date.now() - startedAt.current) / 1000),
        locked: assessment.integrity?.lockOnSubmit || undefined,
      });
      await appendAttemptEvent(attemptId, { type: "submit", at: Date.now() });
      if (assessment.showResultsImmediately) {
        router.push(`/dashboard/student/results/${attemptId}`);
      } else {
        router.push("/dashboard/student/results");
      }
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
      setError("Submit failed. Try again.");
    }
  }, [assessment, profile, institution, attemptId, router]);

  submitRef.current = submit;

  useEffect(() => {
    if (!attemptId || !assessment) return;
    const t = setInterval(() => {
      const perQuestion = Object.entries(answersRef.current).map(([questionId, answer]) => ({
        questionId,
        answer,
        correct: null as boolean | null,
        pointsAwarded: 0,
        maxPoints: 0,
      }));
      void updateAttempt(attemptId, { perQuestion }).then(() =>
        appendAttemptEvent(attemptId, { type: "autosave", at: Date.now() })
      );
    }, 12000);
    return () => clearInterval(t);
  }, [attemptId, assessment]);

  useEffect(() => {
    if (!assessment?.integrity?.confirmLeave && !assessment?.integrity?.tabWarning) return;
    const leave = (e: BeforeUnloadEvent) => {
      if (assessment.integrity?.confirmLeave && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
        if (attemptId) {
          void appendAttemptEvent(attemptId, { type: "leave_attempt", at: Date.now() });
        }
      }
    };
    const vis = () => {
      if (!assessment.integrity?.tabWarning || !attemptId) return;
      void appendAttemptEvent(attemptId, {
        type: document.hidden ? "tab_blur" : "tab_focus",
        at: Date.now(),
      });
      if (document.hidden) {
        setError("Tab switch recorded. Stay on this page until you submit.");
      }
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [assessment, attemptId]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      void submitRef.current();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const clock = useMemo(() => {
    if (secondsLeft === null) return null;
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  if (error && !questions.length) {
    return (
      <DashboardShell role="student" navItems={studentNav} title="Assessment">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          {error}
        </div>
      </DashboardShell>
    );
  }

  if (!assessment) {
    return (
      <DashboardShell role="student" navItems={studentNav} title="Loading…">
        <div className="h-40 bg-white rounded-xl border animate-pulse" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="student"
      navItems={studentNav}
      title={assessment.title}
      subtitle={`${KIND_LABEL[assessment.kind]} · ${assessment.subject}`}
    >
      <div className={`max-w-3xl mx-auto space-y-4 ${profile?.accommodations?.largerText ? "text-lg" : ""}`}>
        {assessment.description && (
          <div className="border border-gray-200 bg-white p-4">
            <HtmlContent html={assessment.description} />
          </div>
        )}
        {assessment.integrity?.webcam && (
          <WebcamBanner attemptId={attemptId} />
        )}
        {assessment.integrity?.tabWarning && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
            Leaving this tab is logged for exam integrity.
          </p>
        )}
        {clock && (
          <div
            className={`sticky top-2 z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold ${
              secondsLeft !== null && secondsLeft < 60
                ? "bg-red-600 text-white"
                : "bg-[var(--dash-primary)] text-[var(--dash-on-primary)]"
            }`}
          >
            <Clock className="w-4 h-4" /> Time remaining {clock}
          </div>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {questions.map((q, i) => (
          <Card key={q.id}>
            <CardHeader>
              <p className="text-sm font-semibold text-gray-900">
                {i + 1}.{" "}
                <span className="font-normal">
                  <HtmlContent html={q.text} className="inline" />
                </span>{" "}
                <span className="text-xs font-normal text-gray-400">({q.points} pts)</span>
              </p>
            </CardHeader>
            <CardBody>
              {q.type === "mcq" && (
                <div className="space-y-2">
                  {(q.options ?? []).map((opt, idx) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer ${
                        answers[q.id] === idx
                          ? "border-[var(--dash-primary)] bg-[var(--dash-primary-soft)]"
                          : "border-gray-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === idx}
                        onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === "truefalse" && (
                <div className="flex gap-3">
                  {([true, false] as const).map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: v })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                        answers[q.id] === v
                          ? "bg-[var(--dash-primary)] text-[var(--dash-on-primary)] border-[var(--dash-primary)]"
                          : "border-gray-200"
                      }`}
                    >
                      {v ? "True" : "False"}
                    </button>
                  ))}
                </div>
              )}
              {(q.type === "short" || q.type === "essay") &&
                (q.type === "essay" ? (
                  <WysiwygEditor
                    content={String(answers[q.id] ?? "")}
                    onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                    placeholder="Write your answer…"
                    minHeight={180}
                  />
                ) : (
                  <textarea
                    rows={3}
                    value={String(answers[q.id] ?? "")}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className={inputClass}
                    placeholder="Your answer"
                  />
                ))}
              {q.type === "coding" && (
                <CodingPlayground
                  q={q}
                  value={String(answers[q.id] ?? q.starterCode ?? "")}
                  onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                />
              )}
              {q.type === "project" && (
                <ProjectAnswer
                  value={
                    (typeof answers[q.id] === "object" && answers[q.id]
                      ? (answers[q.id] as { githubUrl?: string; fileUrl?: string; notes?: string })
                      : { githubUrl: "", fileUrl: "", notes: String(answers[q.id] ?? "") })
                  }
                  onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                />
              )}
            </CardBody>
          </Card>
        ))}
        <Button fullWidth size="lg" loading={submitting} onClick={() => void submit()}>
          Submit {KIND_LABEL[assessment.kind].toLowerCase()}
        </Button>
      </div>
    </DashboardShell>
  );
}
