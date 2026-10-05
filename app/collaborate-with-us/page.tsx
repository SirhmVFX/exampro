import Link from "next/link";
import { Users, Lightbulb, Globe, ArrowRight } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const opportunities = [
  {
    icon: Users,
    title: "Institution partnerships",
    description:
      "Bring ExamPro to your school, university, or training centre. We offer onboarding support, bulk pricing, and a dedicated account contact.",
    cta: "Talk to us",
    href: "/contact",
  },
  {
    icon: Lightbulb,
    title: "Content & curriculum partners",
    description:
      "Publish question banks or learning paths under your brand inside ExamPro. Great for publishers, certification bodies, and bootcamps.",
    cta: "Explore options",
    href: "/contact",
  },
  {
    icon: Globe,
    title: "Resellers & channel partners",
    description:
      "Offer ExamPro to your clients and earn a revenue share. We provide training, co-marketing materials, and a partner dashboard.",
    cta: "Become a partner",
    href: "/contact",
  },
];

export default function CollaborateWithUsPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Collaborate"
        title="Build with us"
        subtitle="We're open to partnerships with institutions, publishers, resellers, and anyone who cares about better assessment."
      />

      <section className="px-6 pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.title}
              className="rounded-2xl border border-white/10 p-8 flex flex-col gap-4"
            >
              <div className="w-10 h-10 border border-white/15 rounded-lg flex items-center justify-center shrink-0">
                <opp.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{opp.title}</h2>
                <p className="text-sm text-white/45 leading-relaxed">
                  {opp.description}
                </p>
              </div>
              <Link
                href={opp.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/70 transition-colors"
              >
                {opp.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
          <h3 className="text-2xl font-semibold mb-3">
            Something else in mind?
          </h3>
          <p className="text-sm text-white/45 mb-6 max-w-lg mx-auto">
            If your idea doesn&apos;t fit neatly above, reach out anyway. We read every message.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Get in touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
