"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";
import { PLANS } from "@/lib/plans";

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Admins upgrade or downgrade from the Billing section of their dashboard at any time. Changes take effect immediately.",
  },
  {
    q: "What happens when I hit the student or teacher limit?",
    a: "New sign-ups are blocked until you upgrade. Everyone already on the platform keeps full access.",
  },
  {
    q: "Is there a setup fee?",
    a: "No. When you register your institution, you get a 30-day free trial — no card required to start. After the trial your account stays on the Free plan (30 students, 3 teachers, 20 AI gens/month) until you upgrade. All your data is always preserved.",
  },
  {
    q: "How does AI question generation work?",
    a: "Teachers describe a topic and question type; Google Gemini generates the questions. Each batch counts against your monthly quota.",
  },
  {
    q: "How does the coding playground work?",
    a: "Student JavaScript runs in a sandboxed Web Worker against test cases you define. Results are instant. Other languages are teacher-graded.",
  },
  {
    q: "Do students need to create accounts?",
    a: "Yes — but it's quick. They enter your institution's join code, fill in their name and email, and they're in. No app download needed.",
  },
  {
    q: "Is my data private?",
    a: "Every institution's data is isolated by a unique ID. No other institution can see your students, questions, or results — even ExamPro staff need direct console access.",
  },
];

export default function PricingPage() {
  const [open, setOpen] = useState(-1);

  return (
    <MarketingShell>
      <PageHero
        kicker="Pricing"
        title="Plans for every institution"
        subtitle="Start free. Upgrade when you grow. Pay securely with Paystack in naira."
      />

      {/* Plan cards */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${plan.highlighted
                ? "border-white bg-white text-black"
                : "border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="text-[10px] uppercase tracking-wider text-black/50 border border-black/15 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-2 leading-relaxed min-h-8 ${plan.highlighted ? "text-black/50" : "text-white/40"
                  }`}
              >
                {plan.tagline}
              </p>

              {/* Price */}
              <p className="text-3xl font-semibold mt-5 tabular-nums">
                {plan.priceUsd < 0
                  ? "Custom"
                  : plan.priceUsd === 0
                    ? "Free"
                    : `$${plan.priceUsd}`}
                {plan.priceUsd > 0 && (
                  <span
                    className={`text-sm font-normal ${plan.highlighted ? "text-black/40" : "text-white/35"
                      }`}
                  >
                    /mo
                  </span>
                )}
              </p>

              <Link
                href={plan.id === "enterprise" ? "/contact" : "/auth/register/institution"}
                className={`mt-6 text-center text-sm py-2.5 rounded-xl font-medium transition ${plan.highlighted
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "border border-white/15 hover:bg-white hover:text-black"
                  }`}
              >
                {plan.id === "enterprise"
                  ? "Contact sales"
                  : plan.priceNgn === 0
                    ? "Start free"
                    : "Start 30-day free trial"}
              </Link>

              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-xs leading-relaxed ${plan.highlighted ? "text-black/70" : "text-white/55"
                      }`}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment note */}
        <p className="text-center text-xs text-white/30 mt-6">
          Payments processed securely by Paystack · USD prices shown · Billed monthly · No auto-renew
        </p>
        <p className="text-center text-xs text-white/20 mt-1.5">
          All paid plans include a 30-day free trial from the date of institution registration. No card required to start.
        </p>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-28 border-t border-white/10 pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">
            Frequently asked questions
          </h2>
          <p className="text-white/40 text-sm mb-10">
            Still have questions?{" "}
            <Link href="/contact" className="underline hover:text-white">
              Talk to the team
            </Link>
            .
          </p>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((item, i) => {
              const on = open === i;
              return (
                <button
                  key={item.q}
                  onClick={() => setOpen(on ? -1 : i)}
                  className="w-full text-left py-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium text-sm">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 mt-0.5 shrink-0 transition-transform ${on ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div
                    className={`grid transition-all duration-300 ${on ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
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
      </section>
    </MarketingShell>
  );
}
