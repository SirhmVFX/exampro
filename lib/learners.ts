import type { Assessment, Enrollment, UserProfile } from "./types";

export function learnerClassNames(profile: UserProfile | null | undefined): string[] {
  if (!profile) return [];
  if (profile.classNames?.length) return profile.classNames;
  if (profile.className) return [profile.className];
  return [];
}

export function assessmentTargets(a: Assessment): string[] {
  if (a.classNames?.length) return a.classNames;
  return a.className ? [a.className] : [];
}

export function assessmentVisibleTo(
  a: Assessment,
  classNames: string[],
  studentId?: string
): boolean {
  if (a.status !== "published") return false;
  if (a.assignedStudentIds?.length) {
    return !!studentId && a.assignedStudentIds.includes(studentId);
  }
  const targets = assessmentTargets(a);
  if (!targets.length) return true;
  const set = new Set(classNames);
  return targets.some((t) => set.has(t));
}

export function enrollmentHealth(e: Enrollment, now = Date.now()): "on_track" | "at_risk" | "done" {
  if (e.status === "completed" || e.status === "alumni") return "done";
  if (e.status === "dropped" || e.status === "waitlist") return "at_risk";
  const weeks = (now - e.startedAt) / (7 * 24 * 60 * 60 * 1000);
  if (weeks >= 3) return "at_risk";
  return "on_track";
}
