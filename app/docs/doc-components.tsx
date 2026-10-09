"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle, Info, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { ALL_PAGES } from "./docs-nav";

// ─── On-this-page ─────────────────────────────────────────────────────────────

export interface Heading { id: string; label: string; depth: 2 | 3 }

export function OnThisPage({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setActive(e.target.id); break; }
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );
    els.forEach((el) => io.observe(el!));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 sticky top-24 self-start h-fit pl-6 border-l border-white/10 ml-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-3">On this page</p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-sm leading-snug transition-colors ${h.depth === 3 ? "pl-3" : ""
                } ${active === h.id
                  ? "text-white font-medium"
                  : "text-white/35 hover:text-white/70"
                }`}
            >
              {h.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// ─── Prev / Next ──────────────────────────────────────────────────────────────

export function PrevNext({ href }: { href: string }) {
  const idx = ALL_PAGES.findIndex((p) => p.href === href);
  const prev = idx > 0 ? ALL_PAGES[idx - 1] : null;
  const next = idx < ALL_PAGES.length - 1 ? ALL_PAGES[idx + 1] : null;

  return (
    <div className="mt-16 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
      {prev ? (
        <Link href={prev.href} className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors ml-auto">
          <span>{next.label}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : null}
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────

export function DocH1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
      {children}
    </h1>
  );
}

export function DocH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-xl font-semibold text-white mt-12 mb-4 scroll-mt-24 group flex items-center gap-2">
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-30 text-white/50 select-none">#</a>
      {children}
    </h2>
  );
}

export function DocH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-base font-semibold text-white/90 mt-8 mb-3 scroll-mt-24 group flex items-center gap-2">
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-30 text-white/50 select-none">#</a>
      {children}
    </h3>
  );
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-white/60 leading-7 mb-4 text-[15px]">{children}</p>;
}

export function DocLead({ children }: { children: React.ReactNode }) {
  return <p className="text-white/50 text-lg leading-relaxed mb-8 mt-2">{children}</p>;
}

export function DocUl({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 mb-6 text-[15px] text-white/60">{children}</ul>;
}

export function DocLi({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2.5 shrink-0" />
      <span className="leading-7">{children}</span>
    </li>
  );
}

// ─── Callouts ─────────────────────────────────────────────────────────────────

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3.5 my-5 text-sm text-blue-300">
      <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3.5 my-5 text-sm text-amber-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3.5 my-5 text-sm text-emerald-300">
      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="relative ml-3 space-y-0">{children}</div>;
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-10 pb-8">
      {/* connector line */}
      <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/10" />
      {/* number circle */}
      <div className="absolute left-0 top-0.5 w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center z-10">
        {n}
      </div>
      <p className="font-semibold text-white mb-1.5">{title}</p>
      <div className="text-[15px] text-white/55 leading-7">{children}</div>
    </div>
  );
}

// ─── Code ─────────────────────────────────────────────────────────────────────

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-white/8 text-white/80 text-[13px] px-1.5 py-0.5 rounded font-mono border border-white/10">
      {children}
    </code>
  );
}

export function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group my-5 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between bg-white/5 px-4 py-2 border-b border-white/10">
        <span className="text-xs text-white/30 font-mono">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(children).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs text-white/30 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-zinc-950 text-emerald-300 p-4 text-[13px] font-mono overflow-x-auto leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function DocTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06] text-white/65">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Card grid ────────────────────────────────────────────────────────────────

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3 my-6">{children}</div>;
}

export function Card({ title, desc, href }: { title: string; desc: string; href?: string }) {
  const inner = (
    <div className="border border-white/10 rounded-xl p-5 h-full hover:border-white/25 hover:bg-white/[0.03] transition-all group">
      <p className="font-semibold text-white text-sm mb-1.5">{title}</p>
      <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
      {href && (
        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 mt-3 transition-colors" />
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export function DocPage({
  children,
  headings,
  href,
}: {
  children: React.ReactNode;
  headings: Heading[];
  href: string;
}) {
  return (
    <div className="flex">
      {/* Article */}
      <article className="flex-1 min-w-0 px-8 xl:px-12 py-10 max-w-3xl">
        {children}
        <PrevNext href={href} />
      </article>

      {/* On this page */}
      <OnThisPage headings={headings} />
    </div>
  );
}
