import { ReactNode } from "react";
import MarketingNavbar from "./navbar";
import MarketingFooter from "./footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function PageHero({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 lp-grid pointer-events-none" />
      <div className="absolute inset-0 lp-noise pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-4">
          {kicker}
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
          {title}
        </h1>
        <p className="mt-5 text-lg text-white/45 leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg border border-white/80 flex items-center justify-center text-white text-[11px] font-bold">
        EP
      </div>
      <span className="text-lg font-semibold text-white">ExamPro</span>
    </div>
  );
}
