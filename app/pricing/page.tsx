"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  const [currency, setCurrency] = useState<"usd" | "ngn">("usd");
  const [open, setOpen] = useState(0);
  const faqs = [
    {
      q: "Can I switch plans later?",
      a: "Yes. Super admins upgrade or switch from Billing at any time. Paystack handles NGN; Stripe handles USD.",
    },
    {
      q: "What happens when I hit student or teacher limits?",
      a: "New signups are blocked until you upgrade. Existing users keep access.",
    },
    {
      q: "Is there a setup fee?",
      a: "No. You start on Free after onboarding. Paid plans are billed monthly.",
    },
    {
      q: "How does AI question generation work?",
      a: "Teachers generate with Gemini. Each run counts against your plan quota for the billing cycle.",
    },
    {
      q: "How does the coding playground work?",
      a: "JavaScript runs in a sandboxed Web Worker against teacher-defined test cases. Other languages are graded by the teacher.",
    },
  ];

  return (
    <MarketingShell>
      <PageHero
        kicker="Pricing"
        title="Plans for every institution"
        subtitle="Start free. Upgrade when you grow. Pay locally with Paystack or internationally with Stripe."
      />

      <section className="px-6 pb-8">
        <div className="flex justify-center">
          <div className="inline-flex border border-white/15 p-1">
            <button
              onClick={() => setCurrency("usd")}
              className={`px-4 py-1.5 text-xs ${
                currency === "usd" ? "bg-white text-black" : "text-white/50"
              }`}
            >
              USD · Stripe
            </button>
            <button
              onClick={() => setCurrency("ngn")}
              className={`px-4 py-1.5 text-xs ${
                currency === "ngn" ? "bg-white text-black" : "text-white/50"
              }`}
            >
              NGN · Paystack
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "border-white bg-white text-black"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{plan.name}</h2>
                {plan.highlighted && (
                  <span className="text-[10px] uppercase tracking-wider text-black/50">
                    Popular
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-2 min-h-8 ${
                  plan.highlighted ? "text-black/50" : "text-white/40"
                }`}
              >
                {plan.tagline}
              </p>
              <p className="text-3xl font-semibold mt-5 tabular-nums">
                {plan.priceUsd < 0
                  ? "Custom"
                  : plan.priceUsd === 0
                    ? "Free"
                    : currency === "usd"
                      ? `$${plan.priceUsd}`
                      : `₦${plan.priceNgn.toLocaleString()}`}
                {plan.priceUsd > 0 && (
                  <span
                    className={`text-sm font-normal ${
                      plan.highlighted ? "text-black/40" : "text-white/35"
                    }`}
                  >
                    /mo
                  </span>
                )}
              </p>
              <Link
                href={
                  plan.id === "enterprise"
                    ? "/contact"
                    : "/auth/register/institution"
                }
                className={`mt-6 text-center text-sm py-2.5 rounded-lg font-medium transition ${
                  plan.highlighted
                    ? "bg-black text-white hover:bg-zinc-800"
                    : "border border-white/15 hover:bg-white hover:text-black"
                }`}
              >
                {plan.id === "enterprise"
                  ? "Contact sales"
                  : plan.priceUsd === 0
                    ? "Start free"
                    : "Start free"}
              </Link>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-xs leading-relaxed ${
                      plan.highlighted ? "text-black/70" : "text-white/50"
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
      </section>

      <section className="px-6 pb-28 border-t border-white/10 pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight mb-8">FAQ</h2>
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
      </section>
    </MarketingShell>
  );
}
