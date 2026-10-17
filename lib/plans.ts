import type { PlanId } from "./types";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceUsd: number; // per month; -1 = custom
  priceNgn: number;
  maxStudents: number; // -1 = unlimited
  maxTeachers: number;
  aiGenerationsPerMonth: number;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For small classrooms trying ExamPro out",
    priceUsd: 0,
    priceNgn: 0,
    maxStudents: 30,
    maxTeachers: 3,
    aiGenerationsPerMonth: 20,
    features: [
      "Up to 30 students & 3 teachers",
      "Quizzes, tests, exams & assignments",
      "Instant auto-grading & results",
      "Basic analytics",
      "20 AI question generations / month",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For growing schools & training centers",
    priceUsd: 39,
    priceNgn: 52000,
    maxStudents: 200,
    maxTeachers: 15,
    aiGenerationsPerMonth: 200,
    features: [
      "Up to 200 students & 15 teachers",
      "Everything in Free",
      "Learning materials with Cloudinary storage",
      "Coding playground assessments",
      "200 AI question generations / month",
      "Announcements & notifications",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For established institutions at scale",
    priceUsd: 89,
    priceNgn: 135000,
    maxStudents: 1000,
    maxTeachers: 50,
    aiGenerationsPerMonth: -1,
    features: [
      "Up to 1,000 students & 50 teachers",
      "Everything in Starter",
      "Unlimited AI question generation",
      "Advanced analytics & progress tracking",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For universities & multi-campus groups",
    priceUsd: -1,
    priceNgn: -1,
    maxStudents: -1,
    maxTeachers: -1,
    aiGenerationsPerMonth: -1,
    features: [
      "Unlimited students & teachers",
      "Everything in Growth",
      "Dedicated account manager",
      "Custom integrations & SLA",
      "Onboarding assistance",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

// Prepaid billing terms: an institution can pay for any whole number of
// months from 1 up to MAX_BILLING_MONTHS in a single checkout.
export const MAX_BILLING_MONTHS = 12;

export function normalizeBillingMonths(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_BILLING_MONTHS);
}

export const BILLING_MONTH_OPTIONS: number[] = Array.from(
  { length: MAX_BILLING_MONTHS },
  (_, i) => i + 1,
);

export function planAllows(
  plan: Plan,
  counts: { students?: number; teachers?: number; aiUsed?: number }
): { students: boolean; teachers: boolean; ai: boolean } {
  return {
    students:
      plan.maxStudents === -1 || (counts.students ?? 0) < plan.maxStudents,
    teachers:
      plan.maxTeachers === -1 || (counts.teachers ?? 0) < plan.maxTeachers,
    ai:
      plan.aiGenerationsPerMonth === -1 ||
      (counts.aiUsed ?? 0) < plan.aiGenerationsPerMonth,
  };
}
