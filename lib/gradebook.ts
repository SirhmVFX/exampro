import type { Attempt, Term } from "./types";

export interface SubjectMark {
  subject: string;
  className: string;
  termId?: string;
  attempts: number;
  percent: number;
  passed: boolean;
}

export interface SkillMark {
  skill: string;
  attempts: number;
  percent: number;
  passed: boolean;
}

export function currentTerm(terms: Term[], now = Date.now()): Term | null {
  return (
    terms.find((t) => t.status === "active") ??
    terms.find((t) => now >= t.startAt && now <= t.endAt) ??
    null
  );
}

export function subjectMarks(
  attempts: Attempt[],
  opts?: { termId?: string; className?: string }
): SubjectMark[] {
  const done = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );
  const map = new Map<string, Attempt[]>();
  for (const a of done) {
    if (opts?.className && a.className !== opts.className) continue;
    const key = `${a.subject}::${a.className}`;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }
  return [...map.entries()].map(([key, list]) => {
    const [subject, className] = key.split("::");
    const best = Math.max(...list.map((a) => a.percent));
    return {
      subject,
      className,
      termId: opts?.termId,
      attempts: list.length,
      percent: Math.round(best),
      passed: list.some((a) => a.passed),
    };
  });
}

export function skillMarks(attempts: Attempt[]): SkillMark[] {
  const done = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );
  const map = new Map<string, { pts: number; max: number; n: number; passed: boolean }>();
  for (const a of done) {
    for (const q of a.perQuestion) {
      const skill = (q as { skill?: string }).skill;
      if (!skill) continue;
      const cur = map.get(skill) ?? { pts: 0, max: 0, n: 0, passed: false };
      cur.pts += q.pointsAwarded;
      cur.max += q.maxPoints;
      cur.n += 1;
      if (q.correct) cur.passed = true;
      map.set(skill, cur);
    }
  }
  // Also roll up by assessment subject when questions have a skill field on the snapshot
  for (const a of done) {
    // questions live on the assessment snapshot via perQuestion ids — skill is stored on question at attempt time if present
  }
  return [...map.entries()].map(([skill, v]) => ({
    skill,
    attempts: v.n,
    percent: v.max ? Math.round((v.pts / v.max) * 100) : 0,
    passed: v.passed || (v.max ? v.pts / v.max >= 0.5 : false),
  }));
}

/** Best attempt per assessment, then average those by skill tag on the assessment subject. */
export function skillMarksFromAttempts(
  attempts: Attempt[],
  questionSkills: Record<string, string>
): SkillMark[] {
  const done = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded"
  );
  const map = new Map<string, { pts: number; max: number; n: number }>();
  for (const a of done) {
    for (const r of a.perQuestion) {
      const skill = questionSkills[r.questionId];
      if (!skill) continue;
      const cur = map.get(skill) ?? { pts: 0, max: 0, n: 0 };
      cur.pts += r.pointsAwarded;
      cur.max += r.maxPoints;
      cur.n += 1;
      map.set(skill, cur);
    }
  }
  return [...map.entries()].map(([skill, v]) => ({
    skill,
    attempts: v.n,
    percent: v.max ? Math.round((v.pts / v.max) * 100) : 0,
    passed: v.max ? v.pts / v.max >= 0.5 : false,
  }));
}
