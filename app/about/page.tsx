import Link from "next/link";
import { ArrowRight, Globe, Shield, Zap, BookOpen } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const values = [
  {
    icon: BookOpen,
    title: "Education first",
    desc: "Every decision is for learners and faculty — not for the demo reel.",
  },
  {
    icon: Shield,
    title: "Tenant isolation",
    desc: "Each school is its own workspace. Queries are scoped by institution. No cross-tenant leakage.",
  },
  {
    icon: Zap,
    title: "Live the same day",
    desc: "Register, onboard classes and subjects, invite teachers. Assessing before evening is the point.",
  },
  {
    icon: Globe,
    title: "Local and global payments",
    desc: "Paystack for NGN. Stripe for USD. A free plan so small classrooms can try the product.",
  },
];

const team = [
  { name: "Adaeze Okonkwo", role: "CEO & Co-founder" },
  { name: "Tunde Adeyemi", role: "CTO & Co-founder" },
  { name: "Ngozi Eze", role: "Head of Design" },
  { name: "Kwabena Mensah", role: "Customer Success" },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="About"
        title="Exam infrastructure for modern schools"
        subtitle="ExamPro gives every institution a branded workspace to run quizzes, tests, exams, and coding assessments — with three roles that match how schools actually work."
      />

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl text-white/50 leading-relaxed">
            From a 30-student classroom on Free to a multi-campus group on
            Enterprise — same product, same join code, plan limits that grow
            with you.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/10 pt-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-8">
            What we stand for
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-white/10 p-7 hover:border-white/25 transition"
              >
                <v.icon className="w-5 h-5 mb-5" />
                <h3 className="font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 border-t border-white/10 pt-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-8">
            Team
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-white/10 p-6 hover:bg-white hover:text-black transition-colors group"
              >
                <div className="w-10 h-10 border border-white/20 group-hover:border-black/20 flex items-center justify-center text-sm font-semibold mb-4">
                  {m.name.charAt(0)}
                </div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs mt-1 text-white/40 group-hover:text-black/50">
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-28 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">
          Join the schools already on ExamPro
        </h2>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/auth/register/institution"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-sm hover:bg-white/5"
          >
            Contact
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
