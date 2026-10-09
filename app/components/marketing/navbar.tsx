"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, ArrowRight,
  Brain, Code2, BarChart3, Shield, BookOpen, FileText,
  Users, Bell, Award, Layers, Zap, Clock,
  GraduationCap, Building2, Briefcase, Globe,
  LayoutDashboard, PenTool,
} from "lucide-react";

// ─── Mega-menu data ───────────────────────────────────────────────────────────

const FEATURES_MENU = {
  columns: [
    {
      heading: "Assessment",
      links: [
        { icon: FileText, label: "6 question types", sub: "MCQ, essay, coding & more", href: "/features#assessment-engine" },
        { icon: Zap, label: "Instant auto-grading", sub: "Results the moment you submit", href: "/features#assessment-engine" },
        { icon: Code2, label: "Coding playground", sub: "JS sandbox with test cases", href: "/features#assessment-engine" },
        { icon: Clock, label: "Timed exams", sub: "Countdown + accommodation time", href: "/features#assessment-engine" },
      ],
    },
    {
      heading: "AI & Questions",
      links: [
        { icon: Brain, label: "AI generation", sub: "Gemini writes the first draft", href: "/features#ai" },
        { icon: Layers, label: "Question library", sub: "Reuse across assessments", href: "/features#ai" },
        { icon: FileText, label: "CSV import & export", sub: "Bulk question management", href: "/features#ai" },
        { icon: Award, label: "Rubric builder", sub: "Multi-criterion scoring", href: "/features#ai" },
      ],
    },
    {
      heading: "Analytics",
      links: [
        { icon: BarChart3, label: "Institution analytics", sub: "Pass rates by class & subject", href: "/features#analytics" },
        { icon: BarChart3, label: "Student progress", sub: "Per-subject averages", href: "/features#analytics" },
        { icon: Award, label: "Certificates", sub: "Publicly verifiable", href: "/features#analytics" },
        { icon: FileText, label: "Result export", sub: "Download as CSV/Excel", href: "/features#analytics" },
      ],
    },
    {
      heading: "Platform",
      links: [
        { icon: Shield, label: "Integrity suite", sub: "Tab detection, webcam logging", href: "/features#integrity" },
        { icon: BookOpen, label: "Learning materials", sub: "Docs, videos, rich notes", href: "/features#learning" },
        { icon: Globe, label: "Custom school portal", sub: "school.exampro.io", href: "/features#learning" },
        { icon: Users, label: "5 user roles", sub: "Admin to parent", href: "/features#learning" },
      ],
    },
  ],
  panel: {
    heading: "Quick links",
    links: [
      { label: "See all features", href: "/features" },
      { label: "Read the docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact sales", href: "/contact" },
    ],
    cta: { label: "Start free — it's ₦0", href: "/auth/register/institution" },
  },
};

const SOLUTIONS_MENU = {
  columns: [
    {
      heading: "By institution",
      links: [
        { icon: GraduationCap, label: "K-12 Schools", sub: "Classes, parents, instant results", href: "/solutions/k12" },
        { icon: Building2, label: "Universities", sub: "Faculties, rubrics, departments", href: "/solutions/university" },
        { icon: Briefcase, label: "Training & Bootcamps", sub: "Paths, coding, certificates", href: "/solutions/training" },
        { icon: LayoutDashboard, label: "Corporate L&D", sub: "Departments, manager dashboards", href: "/solutions/corporate" },
        { icon: BookOpen, label: "Tutoring centres", sub: "Small groups, practice exams", href: "/solutions/tutoring" },
        { icon: Globe, label: "Faith & community", sub: "Quizzes for any gathering", href: "/solutions/faith" },
      ],
    },
    {
      heading: "By role",
      links: [
        { icon: LayoutDashboard, label: "Administrators", sub: "Billing, branding, analytics", href: "/solutions/admins" },
        { icon: PenTool, label: "Teachers", sub: "Create, run, grade", href: "/solutions/teachers" },
        { icon: GraduationCap, label: "Students", sub: "Take exams, track progress", href: "/solutions/students" },
        { icon: Users, label: "Parents", sub: "Results & upcoming exams", href: "/solutions/parents" },
      ],
    },
  ],
  panel: {
    heading: "Resources",
    links: [
      { label: "All solutions", href: "/solutions" },
      { label: "How it works", href: "/#how" },
      { label: "Read the docs", href: "/docs" },
      { label: "Contact sales", href: "/contact" },
    ],
    cta: { label: "Book a 30-min demo", href: "/contact" },
  },
};

const PRODUCT_MENU = {
  columns: [
    {
      heading: "Core tools",
      links: [
        { icon: PenTool, label: "Assessment Builder", sub: "Build any kind of test", href: "/product#assessment" },
        { icon: Brain, label: "AI Question Generator", sub: "Topic → questions in seconds", href: "/product#ai" },
        { icon: GraduationCap, label: "Exam Room", sub: "Where students take the exam", href: "/product#exam-room" },
        { icon: BarChart3, label: "Gradebook & Analytics", sub: "Results, pass rates, exports", href: "/product#analytics" },
      ],
    },
    {
      heading: "Engagement",
      links: [
        { icon: BookOpen, label: "Learning Hub", sub: "Materials + paths + progress", href: "/product#learning" },
        { icon: Bell, label: "Announcements", sub: "Target by role or person", href: "/product#announcements" },
        { icon: Award, label: "Certificates", sub: "Verifiable, shareable", href: "/product#certificates" },
        { icon: Shield, label: "Integrity Suite", sub: "Audit trail for every exam", href: "/product#integrity" },
      ],
    },
    {
      heading: "Admin & ops",
      links: [
        { icon: Users, label: "Roster & Roles", sub: "5 roles, CSV import", href: "/product#roster" },
        { icon: Globe, label: "School Portal", sub: "your-school.exampro.io", href: "/product#portal" },
        { icon: LayoutDashboard, label: "Admin Console", sub: "Settings, billing, audit logs", href: "/product#admin" },
        { icon: Layers, label: "Learning Paths", sub: "Gate content, sequence modules", href: "/product#paths" },
      ],
    },
  ],
  panel: {
    heading: "Get started",
    links: [
      { label: "Full product overview", href: "/product" },
      { label: "Feature list", href: "/features" },
      { label: "Documentation", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
    ],
    cta: { label: "Try ExamPro free", href: "/auth/register/institution" },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuKey = "features" | "solutions" | "product" | null;

interface MegaMenuData {
  columns: {
    heading: string;
    links: { icon: React.ComponentType<{ className?: string }>; label: string; sub: string; href: string }[];
  }[];
  panel: {
    heading: string;
    links: { label: string; href: string }[];
    cta: { label: string; href: string };
  };
}

// ─── Mega-menu panel ──────────────────────────────────────────────────────────

function MegaMenu({ data, onClose }: { data: MegaMenuData; onClose: () => void }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 w-[min(96vw,960px)] pt-2">
      <div className="bg-zinc-950 border border-white/10 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden flex">
        {/* Columns */}
        <div className={`flex-1 grid gap-0 p-6 border-r border-white/[0.06] grid-cols-${data.columns.length}`}
          style={{ gridTemplateColumns: `repeat(${data.columns.length}, 1fr)` }}
        >
          {data.columns.map((col) => (
            <div key={col.heading} className="px-3 first:pl-0 last:pr-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 font-medium">
                {col.heading}
              </p>
              <ul className="space-y-0.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <link.icon className="w-4 h-4 mt-0.5 text-white/40 group-hover:text-white/70 shrink-0 transition-colors" />
                      <div>
                        <p className="text-sm font-medium text-white/80 group-hover:text-white leading-tight">
                          {link.label}
                        </p>
                        <p className="text-xs text-white/35 mt-0.5 leading-tight">{link.sub}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="w-44 shrink-0 p-5 flex flex-col gap-5 bg-white/[0.02]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 font-medium">
              {data.panel.heading}
            </p>
            <ul className="space-y-0.5">
              {data.panel.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="block text-sm text-white/55 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            <Link
              href={data.panel.cta.href}
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white hover:text-black px-3 py-2.5 rounded-xl transition-colors"
            >
              {data.panel.cta.label}
              <ArrowRight className="w-3 h-3 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<MenuKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const solid = scrolled || pathname !== "/";
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => { setActive(null); setMobileOpen(false); }, [pathname]);

  const open = (key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(key);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActive(null), 220);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(null);
  };

  const megaMenus: Record<string, MegaMenuData> = {
    features: FEATURES_MENU,
    solutions: SOLUTIONS_MENU,
    product: PRODUCT_MENU,
  };

  const dropdownItems: { key: MenuKey; label: string }[] = [
    { key: "features", label: "Features" },
    { key: "solutions", label: "Solutions" },
    { key: "product", label: "Product" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${solid
        ? "bg-black/85 backdrop-blur-xl border-b border-white/10"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center justify-between">

          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg border border-white/80 flex items-center justify-center text-white text-[11px] font-bold tracking-tight group-hover:bg-white group-hover:text-black transition-colors">
              EP
            </div>
            <span className="text-base font-semibold text-white tracking-tight">ExamPro</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-white/60">
            {/* Dropdown items */}
            {dropdownItems.map(({ key, label }) => (
              <li
                key={key}
                className="relative"
                onMouseEnter={() => open(key)}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setActive(active === key ? null : key)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-xl transition-colors ${active === key ? "text-white bg-white/8" : "hover:text-white hover:bg-white/5"
                    }`}
                >
                  {label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${active === key ? "rotate-180" : ""}`}
                  />
                </button>

                {active === key && (
                  <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <MegaMenu data={megaMenus[key!]} onClose={close} />
                  </div>
                )}
              </li>
            ))}

            {/* Plain links */}
            <li>
              <Link href="/docs" className="block px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors">
                Docs
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="block px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/blog" className="block px-3.5 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors">
                Blog
              </Link>
            </li>
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3.5 py-2 text-sm font-medium text-white/65 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/register/institution"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-black hover:bg-zinc-100 transition-colors"
            >
              Start free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pb-5 border-t border-white/10 pt-4 space-y-0.5">
            {/* Dropdowns — flat list on mobile */}
            {dropdownItems.map(({ key, label }) => (
              <div key={key}>
                <button
                  onClick={() => setActive(active === key ? null : key)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
                >
                  {label}
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${active === key ? "rotate-180" : ""}`} />
                </button>
                {active === key && (
                  <div className="pl-3 pb-1 space-y-0.5">
                    {megaMenus[key!].columns.flatMap((col) =>
                      col.links.map((link) => (
                        <Link
                          key={link.href + link.label}
                          href={link.href}
                          onClick={() => { setMobileOpen(false); setActive(null); }}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <link.icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          {link.label}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Plain links */}
            {[
              { label: "Docs", href: "/docs" },
              { label: "Pricing", href: "/pricing" },
              { label: "Blog", href: "/blog" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/5 transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {/* CTA row */}
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl border border-white/15 text-sm text-white hover:bg-white/5 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register/institution"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop — only closes on click, never blocks hover */}
      {active && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={close}
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
        />
      )}
    </nav>
  );
}
