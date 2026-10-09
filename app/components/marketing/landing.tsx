"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ClipboardList,
  Code2,
  FileText,
  GraduationCap,
  Globe,
  LayoutDashboard,
  Library,
  Play,
  Shield,
  Award,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import MarketingNavbar from "./navbar";
import MarketingFooter from "./footer";
import { PLANS } from "@/lib/plans";

/* ─── small primitives ─────────────────────────────────────────────────── */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setShow(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${className}`}
    >
      {children}
    </div>
  );
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return n;
}

/* ─── Animated dashboard preview (hero right panel) ────────────────────── */

const SLIDES = [
  {
    role: "Admin",
    color: "#6366f1",
    screen: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[["Students", "248"], ["Teachers", "18"], ["Pass rate", "87%"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-white/40 mb-1">{l}</p>
              <p className="text-lg font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40 mb-2">Attempts this week</p>
          <div className="flex items-end gap-1 h-14">
            {[42, 68, 51, 88, 73, 95, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-indigo-400/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/40 mb-0.5">Join code</p>
            <p className="text-base font-mono tracking-[0.25em] text-white">K7MQ2P</p>
          </div>
          <div className="text-[10px] px-2 py-1 border border-white/15 text-white/50 rounded-md">Copy</div>
        </div>
      </div>
    ),
  },
  {
    role: "Teacher",
    color: "#10b981",
    screen: (
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-white/40">Question library</p>
            <div className="flex items-center gap-1 text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md">
              <Sparkles className="w-2.5 h-2.5" /> AI Generate
            </div>
          </div>
          <p className="text-xs text-white leading-relaxed">Which HTTP status code means a resource was created successfully?</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {["MCQ", "Essay", "Coding", "Short"].map((t) => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 border border-white/10 text-white/40 rounded">{t}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40 mb-2">Submissions</p>
          {[["Amara O.", "94%", true], ["Tunde A.", "61%", true], ["Kemi F.", "Needs grading", false]].map(([n, s, g]) => (
            <div key={String(n)} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-white/70">{n}</span>
              <span className={`text-[10px] font-medium ${g ? (Number(String(s).replace('%', '')) >= 70 ? "text-emerald-400" : "text-amber-400") : "text-white/40"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    role: "Student",
    color: "#f59e0b",
    screen: (
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Exam · Computer Science</p>
              <p className="text-sm font-medium text-white">HTTP Fundamentals</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-white border border-white/15 rounded-md px-2 py-1">
              <Timer className="w-3 h-3" />12:48
            </div>
          </div>
          <p className="text-xs text-white mb-2">1. Which status code means a resource was created?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {["200 OK", "201 Created", "204 No Content", "301 Moved"].map((opt, i) => (
              <div key={opt} className={`text-[10px] px-2 py-1.5 rounded-md border ${i === 1 ? "border-white bg-white text-black font-semibold" : "border-white/10 text-white/50"}`}>
                {opt}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[["Avg score", "84%"], ["Attempts", "12"], ["Certificates", "2"]].map(([l, v]) => (
            <div key={l} className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-center">
              <p className="text-[9px] text-white/35">{l}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function HeroDashboard() {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SLIDES.length);
        setAnimating(false);
      }, 350);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="relative w-full h-full select-none pointer-events-none">
      {/* Browser chrome */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl shadow-black/60">
        {/* Titlebar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-black/40">
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <div className="ml-2 flex-1 h-5 rounded bg-white/5 flex items-center px-2 text-[10px] text-white/25 font-mono">
            app.exampro.io/dashboard/{slide.role.toLowerCase()}
          </div>
        </div>

        {/* Sidebar + content */}
        <div className="flex h-[340px]">
          {/* Mini sidebar */}
          <div className="w-10 bg-black/60 border-r border-white/10 flex flex-col items-center py-3 gap-3">
            <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center text-[8px] font-bold text-white">EP</div>
            {[LayoutDashboard, FileText, BarChart3, Users, Bell].map((Icon, i) => (
              <div key={i} className={`w-6 h-6 rounded flex items-center justify-center ${i === 0 ? "bg-white/10" : ""}`}>
                <Icon className="w-3 h-3 text-white/40" />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div
            className={`flex-1 p-3 overflow-hidden transition-all duration-350 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
            style={{ transition: "opacity 0.35s ease, transform 0.35s ease" }}
          >
            {/* Role badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: slide.color }} />
              <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{slide.role} Dashboard</p>
            </div>
            {slide.screen}
          </div>
        </div>
      </div>

      {/* Role indicator dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {SLIDES.map((s, i) => (
          <div
            key={s.role}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === idx ? "20px" : "6px",
              background: i === idx ? slide.color : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */

const CYCLE = ["quizzes", "exams", "coding tests", "assignments"];

function Hero({
  onPreviewRole,
}: {
  onPreviewRole: (role: Role) => void;
}) {
  const [word, setWord] = useState(0);
  const [spot, setSpot] = useState({ x: 50, y: 30 });
  const area = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setInterval(() => setWord((w) => (w + 1) % CYCLE.length), 2400);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const r = area.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  return (
    <section
      ref={area}
      onMouseMove={onMove}
      className="relative pt-32 pb-8 md:pt-40 md:pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 lp-grid pointer-events-none" />
      <div className="absolute inset-0 lp-noise pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.07), transparent 55%)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Two-column layout: copy left, dashboard right */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 border border-white/15 px-3 py-1 text-xs text-white/60 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Now in public beta · Free plan included
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
              Assessment software
              <br />
              for institutions.
              <br />
              <span className="text-white/35">Run </span>
              <span className="relative inline-block min-w-[10ch] text-white">
                {CYCLE[word]}
                <span className="lp-caret inline-block w-[2px] h-[0.8em] bg-white ml-1 align-[-0.1em]" />
              </span>
            </h1>

            <p className="mt-6 text-lg text-white/50 max-w-xl leading-relaxed">
              One workspace per school. Super admins run the institution, teachers
              set work with AI, students take it — scored instantly, including
              coding playgrounds.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register/institution"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
              >
                Start free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition"
              >
                <Play className="w-3.5 h-3.5" />
                See the product
              </a>
            </div>

            <p className="mt-5 text-xs text-white/35">
              No card required · 30-day free trial · Plans from $29/mo · Cancel anytime
            </p>

            <div className="mt-10 flex flex-wrap gap-2">
              {(
                [
                  ["admin", "Admin"],
                  ["teacher", "Teacher"],
                  ["student", "Student"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    onPreviewRole(id);
                    document.getElementById("product")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs px-3 py-1.5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition"
                >
                  Preview {label} →
                </button>
              ))}
            </div>
          </div>

          {/* Right — animated dashboard */}
          <div className="hidden lg:block">
            <HeroDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Marquee ──────────────────────────────────────────────────────────── */

function Marquee() {
  const names = [
    "Northridge Academy",
    "Lagos Code School",
    "Apex University",
    "BrightPath College",
    "Helix Bootcamp",
    "Summit High",
    "Oriole Institute",
    "Westfield Training",
  ];
  const row = [...names, ...names];
  return (
    <section className="border-y border-white/10 py-8 overflow-hidden">
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-white/30 mb-6">
        Built for every kind of institution
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="lp-marquee flex w-max gap-12">
          {row.map((n, i) => (
            <span
              key={`${n}-${i}`}
              className="text-sm font-medium text-white/25 whitespace-nowrap tracking-wide"
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Interactive product ──────────────────────────────────────────────── */

type Role = "admin" | "teacher" | "student";

function ProductPreview({
  role,
  setRole,
}: {
  role: Role;
  setRole: (r: Role) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [typed, setTyped] = useState("");
  const question =
    "Which HTTP status code means a resource was created successfully?";

  const generate = () => {
    setGenerating(true);
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(question.slice(0, i));
      if (i >= question.length) {
        clearInterval(id);
        setGenerating(false);
      }
    }, 18);
  };

  const tabs: { id: Role; label: string; hint: string }[] = [
    { id: "admin", label: "Super admin", hint: "School-wide control" },
    { id: "teacher", label: "Teacher", hint: "Create & grade" },
    { id: "student", label: "Student", hint: "Take & track" },
  ];

  return (
    <section id="product" className="py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
            Product
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white max-w-2xl">
            Three dashboards. One institution.
          </h2>
          <p className="mt-4 text-white/45 max-w-xl">
            Click a role. The workspace changes — because that&apos;s how the
            real product works.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setRole(t.id)}
              className={`px-4 py-2.5 rounded-lg text-sm transition border ${role === t.id
                ? "bg-white text-black border-white"
                : "border-white/10 text-white/55 hover:text-white hover:border-white/25"
                }`}
            >
              <span className="font-medium">{t.label}</span>
              <span className={`ml-2 text-xs ${role === t.id ? "text-black/50" : "text-white/30"}`}>
                {t.hint}
              </span>
            </button>
          ))}
        </div>

        <Reveal className="mt-8" delay={80}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <div className="ml-3 flex-1 h-6 rounded-md bg-white/5 flex items-center px-3 text-[11px] text-white/30 font-mono">
                app.exampro.io/{role}
              </div>
            </div>

            <div className="p-5 md:p-8 min-h-[340px]">
              {role === "admin" && (
                <div className="grid md:grid-cols-5 gap-5">
                  <div className="md:col-span-3 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["Students", "248"],
                        ["Teachers", "18"],
                        ["Pass rate", "87%"],
                      ].map(([l, v]) => (
                        <div
                          key={l}
                          className="rounded-xl border border-white/10 p-4 hover:border-white/25 transition"
                        >
                          <p className="text-[11px] text-white/40">{l}</p>
                          <p className="text-2xl font-semibold text-white mt-1">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/10 p-4">
                      <p className="text-[11px] text-white/40 mb-4">
                        Attempts this week
                      </p>
                      <div className="flex items-end gap-1.5 h-24">
                        {[42, 68, 51, 88, 73, 95, 80].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-white/80 rounded-sm origin-bottom"
                            style={{
                              height: `${h}%`,
                              animation: `lp-bar 0.7s ease-out ${i * 60}ms both`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="rounded-xl border border-white/10 p-4">
                      <p className="text-[11px] text-white/40 mb-2">Join code</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-mono tracking-[0.35em] text-white">
                          K7MQ2P
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("K7MQ2P").catch(() => { });
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1600);
                          }}
                          className="text-xs px-2.5 py-1 rounded-md border border-white/15 text-white/70 hover:bg-white hover:text-black transition"
                        >
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 p-4 space-y-3">
                      <p className="text-[11px] text-white/40">Announcement</p>
                      <p className="text-sm text-white">Midterms open Monday.</p>
                      <p className="text-xs text-white/40">
                        Sent to all students · 214 read
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {role === "teacher" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-white">Question library</p>
                      <button
                        onClick={generate}
                        disabled={generating}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white text-black font-medium disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {generating ? "Generating…" : "Generate with AI"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-white/10 p-4 min-h-28">
                      {typed ? (
                        <p className="text-sm text-white leading-relaxed">
                          {typed}
                          {generating && (
                            <span className="lp-caret inline-block w-[2px] h-4 bg-white ml-0.5 align-middle" />
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-white/30">
                          Click generate — Gemini drafts questions into your library.
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["MCQ", "True / False", "Short", "Essay", "Coding"].map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-1 rounded-md border border-white/10 text-white/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 p-4">
                    <p className="text-sm font-medium text-white mb-3">Publish as</p>
                    {["Quiz", "Test", "Exam", "Assignment"].map((k, i) => (
                      <label
                        key={k}
                        className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 cursor-pointer group"
                      >
                        <span className="w-4 h-4 rounded-full border border-white/30 group-hover:border-white flex items-center justify-center">
                          {i === 2 && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span className="text-sm text-white/80">{k}</span>
                        <span className="ml-auto text-[11px] text-white/30">
                          {i === 2 ? "Selected" : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {role === "student" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">
                        Exam · Computer Science
                      </p>
                      <p className="text-lg font-medium text-white">HTTP fundamentals</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-white border border-white/15 rounded-lg px-3 py-1.5">
                      <Timer className="w-3.5 h-3.5" />
                      12:48
                    </div>
                  </div>
                  <p className="text-sm text-white mb-4">
                    1. Which status code means a resource was created?
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {["200 OK", "201 Created", "204 No Content", "301 Moved"].map(
                      (opt, i) => {
                        const on = picked === i;
                        const correct = i === 1;
                        return (
                          <button
                            key={opt}
                            onClick={() => setPicked(i)}
                            className={`text-left text-sm px-4 py-3 rounded-xl border transition ${on
                              ? correct
                                ? "border-white bg-white text-black"
                                : "border-white/40 bg-white/10 text-white"
                              : "border-white/10 text-white/70 hover:border-white/30"
                              }`}
                          >
                            {opt}
                            {on && correct && (
                              <span className="float-right text-xs">Correct</span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-xs text-white/35">
                    <Code2 className="w-3.5 h-3.5" />
                    Next: a JavaScript playground question with live test cases.
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Bento features ───────────────────────────────────────────────────── */

function Features() {
  // Bento grid: wide items span 2 columns, narrow span 1
  const items = [
    {
      title: "AI question generation",
      desc: "Describe a topic and difficulty. Gemini drafts MCQ, true/false, short answer, essay, or coding questions in seconds. Edit every line before saving — AI does the first draft, you have final say.",
      icon: Sparkles,
      wide: true,
    },
    {
      title: "Instant auto-grading",
      desc: "MCQ, true/false, and short-answer questions grade the moment a student submits. No waiting.",
      icon: Check,
    },
    {
      title: "Coding playground",
      desc: "Students write JavaScript in the browser. A sandboxed Web Worker runs their code against your test cases and returns pass/fail — instantly, with partial credit.",
      icon: Code2,
    },
    {
      title: "6 question types",
      desc: "MCQ · True/False · Short answer · Essay · Coding playground · Project upload. Mix them in one assessment.",
      icon: Library,
    },
    {
      title: "Learning materials & paths",
      desc: "Upload PDFs, paste YouTube links, or write rich-text notes. Sequence them into a learning path and gate the exam — students must complete materials before the assessment unlocks.",
      icon: GraduationCap,
      wide: true,
    },
    {
      title: "Exam integrity",
      desc: "Tab-switch detection, webcam presence logging, confirm-on-leave dialogs. Every event is timestamped so teachers see exactly what happened during the exam.",
      icon: Shield,
    },
    {
      title: "Certificates",
      desc: "Issue completion certificates with a unique public verify link. Students share them with employers; anyone can confirm authenticity at exampro.io/verify/code.",
      icon: Award,
      wide: true,
    },
    {
      title: "Institution analytics",
      desc: "Pass rates by class and subject. Teacher performance table. Admins see the whole institution; teachers see only their rooms.",
      icon: BarChart3,
    },
    {
      title: "Announcements",
      desc: "Send rich-text messages to everyone, all students, all teachers, or one specific person. Read counts show who has seen what.",
      icon: Bell,
    },
    {
      title: "Custom school portal",
      desc: "Every institution gets a branded portal at their-school.exampro.io with their logo and colours. One subdomain, zero extra setup.",
      icon: Globe,
    },
    {
      title: "Roster import & roles",
      desc: "Bulk-import students and teachers from a CSV. Five roles — admin, teacher, student, parent, manager — each with a tailored dashboard and scoped access.",
      icon: Users,
      wide: true,
    },
    {
      title: "Rubrics",
      desc: "Build multi-criterion rubrics for essays and projects. Teachers score each criterion separately; feedback appears per question in the student result.",
      icon: ClipboardList,
    },
  ];

  return (
    <section id="features" className="py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
            Platform
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Everything after signup
          </h2>
          <p className="mt-4 text-white/45 max-w-xl">
            Every tool in the assessment lifecycle — from writing the first question to handing out a certificate.
          </p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 50}
              className={(item as { wide?: boolean }).wide ? "md:col-span-2" : ""}
            >
              <div className="group h-full rounded-2xl border border-white/10 p-7 hover:border-white/25 hover:bg-white/[0.02] transition-all">
                <item.icon className="w-5 h-5 text-white mb-5 opacity-70" />
                <h3 className="text-base font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─────────────────────────────────────────────────────── */

function How() {
  const steps = [
    { n: "01", t: "Register the school", d: "Admin creates the workspace and gets a 6-character join code." },
    { n: "02", t: "Onboard structure", d: "Name your classes — Grade, Level, or Cohort — and list subjects." },
    { n: "03", t: "Invite faculty & students", d: "Share the code, or collect emails. Plan limits are enforced." },
    { n: "04", t: "Teach, assess, score", d: "Materials, AI questions, timed exams, retakes, live analytics." },
  ];
  return (
    <section id="how" className="py-24 scroll-mt-24 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Live in an afternoon
          </h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-4 left-0 right-0 h-px bg-white/10" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative">
                <div className="w-8 h-8 bg-black border border-white text-[11px] font-mono text-white flex items-center justify-center mb-5">
                  {s.n}
                </div>
                <h3 className="text-white font-medium mb-2">{s.t}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Roles ────────────────────────────────────────────────────────────── */

function Roles() {
  const roles = [
    {
      icon: Users,
      name: "Super admin",
      points: [
        "Onboard the institution",
        "Invite or admit teachers & students",
        "Broadcast to one person or everyone",
        "Billing via Paystack or Stripe",
      ],
    },
    {
      icon: Library,
      name: "Teacher",
      points: [
        "AI + manual question bank",
        "Quizzes, tests, exams, assignments",
        "Coding playgrounds",
        "Manual grade essays & other languages",
      ],
    },
    {
      icon: GraduationCap,
      name: "Student",
      points: [
        "Timed, shuffled papers",
        "Instant results when allowed",
        "Retake if the teacher says so",
        "Progress by subject and class",
      ],
    },
  ];
  return (
    <section id="roles" className="py-24 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
            Roles
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Built for how schools actually run
          </h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-3">
          {roles.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/10 p-7 hover:bg-white text-white hover:text-black transition-colors duration-300 group">
                <r.icon className="w-5 h-5 mb-5" />
                <h3 className="text-lg font-medium mb-5">{r.name}</h3>
                <ul className="space-y-2.5">
                  {r.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-white/50 group-hover:text-black/60">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ────────────────────────────────────────────────────────────── */

function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setOn(true);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const a = useCountUp(4, on);
  const b = useCountUp(5, on);
  const c = useCountUp(3, on);
  return (
    <div ref={ref} className="border-y border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-3 gap-6 text-center">
        {[
          [a, "assessment types"],
          [b, "question formats"],
          [c, "roles per school"],
        ].map(([n, l]) => (
          <div key={String(l)}>
            <p className="text-4xl md:text-5xl font-semibold text-white tabular-nums">
              {n}
            </p>
            <p className="text-sm text-white/35 mt-2">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pricing teaser ───────────────────────────────────────────────────── */

function PricingTeaser() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
              Start free. Scale the school.
            </h2>
          </div>
          <p className="text-sm text-white/35 self-start md:self-end">All prices in USD · Billed monthly</p>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <div
                className={`h-full rounded-2xl border p-6 flex flex-col ${p.highlighted
                  ? "border-white bg-white text-black"
                  : "border-white/10 text-white"
                  }`}
              >
                <p className="text-sm font-medium">{p.name}</p>
                <p className={`text-3xl font-semibold mt-4 tabular-nums ${p.highlighted ? "text-black" : "text-white"}`}>
                  {p.priceUsd < 0
                    ? "Custom"
                    : p.priceUsd === 0
                      ? "Free"
                      : `$${p.priceUsd}`}
                </p>
                <p className={`text-xs mt-1 ${p.highlighted ? "text-black/50" : "text-white/35"}`}>
                  {p.priceUsd > 0 ? "per month" : p.tagline}
                </p>
                <ul className="mt-6 space-y-2 flex-1">
                  {p.features.slice(0, 4).map((f) => (
                    <li
                      key={f}
                      className={`text-xs leading-relaxed ${p.highlighted ? "text-black/70" : "text-white/50"}`}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.id === "enterprise" ? "/contact" : "/auth/register/institution"}
                  className={`mt-6 text-center text-sm py-2.5 rounded-lg font-medium transition ${p.highlighted
                    ? "bg-black text-white hover:bg-zinc-800"
                    : "border border-white/15 hover:bg-white hover:text-black"
                    }`}
                >
                  {p.id === "enterprise" ? "Talk to us" : p.priceUsd === 0 ? "Start free" : "Start free trial"}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link href="/pricing" className="text-sm text-white/40 hover:text-white inline-flex items-center gap-1">
            Full comparison <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ─── FAQ ──────────────────────────────────────────────────────────────── */

function FAQ() {
  const items = [
    {
      q: "Is this one app per school?",
      a: "Yes. Each institution is a tenant with its own join code, classes, subjects, teachers, and students. Data is scoped by institution — nobody sees another school.",
    },
    {
      q: "How do teachers and students join?",
      a: "Admins share a 6-character code or invite link. Faculty pick the subjects and classes they teach. Students pick their class, grade, or cohort.",
    },
    {
      q: "What can students be assessed with?",
      a: "Quizzes, tests, exams, and assignments. Question types: multiple choice, true/false, short answer, essay, and coding (JavaScript auto-grades in a sandbox; other languages go to the teacher).",
    },
    {
      q: "How do Paystack and Stripe fit in?",
      a: "Institutions start on Free. Admins upgrade from Billing — Paystack for NGN, Stripe for USD. Limits on students, teachers, and AI generations follow the plan.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 scroll-mt-24 border-t border-white/10">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-10">
            Straight answers
          </h2>
        </Reveal>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item, i) => {
            const on = open === i;
            return (
              <button
                key={item.q}
                onClick={() => setOpen(on ? -1 : i)}
                className="w-full text-left py-5 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-white font-medium">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-white/40 shrink-0 mt-1 transition-transform ${on ? "rotate-180" : ""}`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ${on ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}
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
  );
}

/* ─── CTA ──────────────────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white">
            Put your next exam
            <br />
            on rails.
          </h2>
          <p className="mt-5 text-white/45 max-w-md mx-auto">
            Register the institution. Invite faculty. Students join with a code.
            You&apos;re assessing the same day.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register/institution"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
            >
              Create your workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-white text-sm hover:bg-white/5 transition"
            >
              Sign in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [role, setRole] = useState<Role>("admin");

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white selection:text-black">
      <MarketingNavbar />
      <main>
        <Hero onPreviewRole={setRole} />
        <Marquee />
        <ProductPreview role={role} setRole={setRole} />
        <Features />
        <How />
        <Roles />
        <Stats />
        <PricingTeaser />
        <FAQ />
        <CTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
