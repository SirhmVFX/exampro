import type { Assessment, Attempt, MaterialProgress } from "./types";

export const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] focus:border-transparent bg-white";

export function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(mins: number): string {
  if (!mins) return "Untimed";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const KIND_LABEL: Record<string, string> = {
  quiz: "Quiz",
  test: "Test",
  exam: "Exam",
  assignment: "Assignment",
  project: "Project",
  practice: "Practice",
};

export const TYPE_LABEL: Record<string, string> = {
  mcq: "Multiple choice",
  truefalse: "True / False",
  short: "Short answer",
  essay: "Essay",
  coding: "Coding",
  project: "Project",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export interface TakeGate {
  ok: boolean;
  reason?: string;
}

export function canTakeAssessment(
  a: Assessment,
  studentAttempts: Attempt[],
  completedMaterialIds: Set<string>,
  studentId?: string
): TakeGate {
  if (a.status !== "published") {
    return { ok: false, reason: "This assessment is not currently available." };
  }
  if (a.assignedStudentIds?.length) {
    if (!studentId || !a.assignedStudentIds.includes(studentId)) {
      return { ok: false, reason: "This assessment is not assigned to you." };
    }
  }
  const now = Date.now();
  if (a.startAt && now < a.startAt) {
    return {
      ok: false,
      reason: `Opens ${formatDateTime(a.startAt)}.`,
    };
  }
  if (a.endAt && now > a.endAt) {
    return { ok: false, reason: "This assessment has closed." };
  }
  if (a.requiredMaterialId && !completedMaterialIds.has(a.requiredMaterialId)) {
    return {
      ok: false,
      reason: "Complete the required learning material before taking this.",
    };
  }
  if (a.requiredAssessmentId) {
    const prior = studentAttempts.find(
      (x) =>
        x.assessmentId === a.requiredAssessmentId &&
        (x.status === "submitted" || x.status === "graded") &&
        x.passed
    );
    if (!prior) {
      return {
        ok: false,
        reason: "Pass the previous assessment in this path first.",
      };
    }
  }
  const finished = studentAttempts.filter(
    (x) =>
      x.assessmentId === a.id &&
      (x.status === "submitted" || x.status === "graded")
  );
  if (!a.allowRetake && finished.length > 0) {
    return { ok: false, reason: "Retakes are not allowed." };
  }
  if (a.maxAttempts > 0 && finished.length >= a.maxAttempts) {
    return {
      ok: false,
      reason: `You've used all ${a.maxAttempts} attempt${a.maxAttempts === 1 ? "" : "s"}.`,
    };
  }
  return { ok: true };
}

export function completedMaterialIds(
  progress: MaterialProgress[]
): Set<string> {
  return new Set(progress.filter((p) => p.completed).map((p) => p.materialId));
}

export function averagePercent(attempts: Attempt[]): number | null {
  const done = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );
  if (!done.length) return null;
  return Math.round(done.reduce((s, a) => s + a.percent, 0) / done.length);
}

export function passRate(attempts: Attempt[]): number | null {
  const done = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );
  if (!done.length) return null;
  return Math.round((done.filter((a) => a.passed).length / done.length) * 100);
}
