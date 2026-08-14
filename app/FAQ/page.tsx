"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const faqs = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is ExamPro?",
        a: "A multi-tenant assessment SaaS. Each school gets its own workspace: admin, teachers, and students. Quizzes, tests, exams, assignments, coding playgrounds, and analytics.",
      },
      {
        q: "How do I register my institution?",
        a: "Start free, create the admin account, then finish onboarding — class labels, classes, subjects, optional logo, optional teacher invites.",
      },
      {
        q: "Is there a free plan?",
        a: "Yes. Free includes 30 students, 3 teachers, and 20 AI generations per month. No card required.",
      },
    ],
  },
  {
    category: "Assessments",
    items: [
      {
        q: "What can teachers assign?",
        a: "Quizzes, tests, exams, and assignments. Question types: multiple choice, true/false, short answer, essay, and coding.",
      },
      {
        q: "Are they auto-graded?",
        a: "MCQ, true/false, and short answer grade instantly. JavaScript coding runs in a sandbox against test cases. Essays and other languages go to the teacher.",
      },
      {
        q: "Can students retake?",
        a: "If the teacher allows it. They can also cap the number of attempts.",
      },
    ],
  },
  {
    category: "People",
    items: [
      {
        q: "How do teachers and students join?",
        a: "With the institution join code or invite link. Teachers pick subjects and classes. Students pick their class, grade, or cohort.",
      },
      {
        q: "Can the admin message everyone?",
        a: "Yes. Announcements go to all, all students, all teachers, or one person. They show in the dashboard bell.",
      },
    ],
  },
  {
    category: "Billing & security",
    items: [
      {
        q: "Paystack or Stripe?",
        a: "Both. NGN via Paystack, USD via Stripe. Admins upgrade from Billing.",
      },
      {
        q: "Is school data isolated?",
        a: "Yes. Every collection is scoped by institutionId. Firestore rules enforce the same tenant check.",
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(faqs[0].items[0].q);

  return (
    <MarketingShell>
      <PageHero
        kicker="FAQ"
        title="Questions, answered"
        subtitle="How the product actually works — roles, assessments, billing."
      />
      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.map((section) => (
            <div key={section.category}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-4">
                {section.category}
              </p>
              <div className="divide-y divide-white/10 border-y border-white/10">
                {section.items.map((item) => {
                  const on = open === item.q;
                  return (
                    <button
                      key={item.q}
                      onClick={() => setOpen(on ? null : item.q)}
                      className="w-full text-left py-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-medium">{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-white/40 mt-1 transition-transform ${on ? "rotate-180" : ""}`}
                        />
                      </div>
                      <div
                        className={`grid transition-all duration-300 ${
                          on
                            ? "grid-rows-[1fr] opacity-100 mt-3"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <p className="overflow-hidden text-sm text-white/45 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
