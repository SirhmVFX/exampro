import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  PenTool,
  GraduationCap,
  BarChart3,
  Users,
  Shield,
  BookOpen,
  Brain,
  Award,
  Bell,
} from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const products = [
  {
    icon: PenTool,
    name: "Assessment Builder",
    tagline: "Create any kind of test",
    desc: "Build quizzes, exams, assignments, or coding challenges with 6 question types. Set timers, shuffle questions, configure retake rules, and publish in minutes.",
    href: "/features#assessment-engine",
    color: "from-violet-500/10 to-transparent",
  },
  {
    icon: Brain,
    name: "AI Question Generator",
    tagline: "Let Gemini write the first draft",
    desc: "Describe a topic, pick a difficulty, and generate up to 20 questions in seconds. Edit, save to your library, and reuse across assessments.",
    href: "/features#ai",
    color: "from-blue-500/10 to-transparent",
  },
  {
    icon: GraduationCap,
    name: "Exam Room",
    tagline: "Where students take the exam",
    desc: "A clean, full-screen exam experience with autosave every 12 seconds, countdown timer, tab-switch warnings, webcam presence logging, and a live coding playground.",
    href: "/features#integrity",
    color: "from-emerald-500/10 to-transparent",
  },
  {
    icon: BarChart3,
    name: "Analytics & Gradebook",
    tagline: "See exactly how students are doing",
    desc: "Pass rates by class and subject, teacher performance tables, per-student subject averages, and a full attempt history with question-by-question breakdown.",
    href: "/features#analytics",
    color: "from-amber-500/10 to-transparent",
  },
  {
    icon: BookOpen,
    name: "Learning Hub",
    tagline: "Materials, paths, and progress",
    desc: "Upload documents, videos, links, and notes. Sequence them into learning paths with gating — students can't take an assessment until they've completed prerequisites.",
    href: "/features#learning",
    color: "from-pink-500/10 to-transparent",
  },
  {
    icon: Bell,
    name: "Announcements",
    tagline: "Reach everyone in one click",
    desc: "Rich-text announcements targeted to everyone, just students, just teachers, or a specific person. Read counts show you who's seen what.",
    href: "/features#learning",
    color: "from-orange-500/10 to-transparent",
  },
  {
    icon: Users,
    name: "Roster & Roles",
    tagline: "5 roles, one platform",
    desc: "Admin, teacher, student, parent, and manager — each with a tailored dashboard. Bulk-import students and teachers from a CSV. Manage cohorts, waitlists, and departments.",
    href: "/solutions",
    color: "from-cyan-500/10 to-transparent",
  },
  {
    icon: Shield,
    name: "Integrity Suite",
    tagline: "Keep exams honest",
    desc: "Tab-switch detection, page-leave logging, webcam presence, leave confirmation dialogs, and a per-submission event timeline for teacher review.",
    href: "/features#integrity",
    color: "from-red-500/10 to-transparent",
  },
  {
    icon: Award,
    name: "Certificates",
    tagline: "Verifiable proof of completion",
    desc: "Issue certificates manually or after a learning path. Every certificate gets a unique verification URL anyone can check at exampro.io/verify/code.",
    href: "/features#analytics",
    color: "from-yellow-500/10 to-transparent",
  },
  {
    icon: LayoutDashboard,
    name: "Admin Console",
    tagline: "Run your whole institution",
    desc: "Branding, custom school portal URL, join modes, billing, audit logs, announcements, structure (classes/subjects/skills), and institution-wide analytics in one place.",
    href: "/docs#admin",
    color: "from-indigo-500/10 to-transparent",
  },
];

export default function ProductPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Product"
        title="One platform, the full workflow"
        subtitle="ExamPro covers every step — from writing a question to handing out a certificate."
      />

      {/* Product grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className={`group relative border border-white/10 rounded-2xl p-7 overflow-hidden hover:border-white/25 transition-all bg-gradient-to-br ${p.color}`}
            >
              <div className="w-9 h-9 border border-white/15 rounded-lg flex items-center justify-center mb-4">
                <p.icon className="w-4 h-4" />
              </div>
              <p className="font-semibold mb-0.5">{p.name}</p>
              <p className="text-xs text-white/40 mb-3">{p.tagline}</p>
              <p className="text-sm text-white/50 leading-relaxed mb-5">{p.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs text-white/35 group-hover:text-white transition-colors">
                Learn more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it all fits together */}
      <section className="px-6 pb-28 border-t border-white/10 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">How it all fits together</h2>
          <p className="text-sm text-white/45 leading-relaxed mb-12 max-w-2xl mx-auto">
            Admin sets up the institution → teachers build question banks and assessments → students take exams and complete materials → teachers grade and give feedback → analytics surface who needs help → certificates reward completion.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-white/40">
            {["Institution setup", "→", "Question bank", "→", "Assessment", "→", "Exam room", "→", "Grading", "→", "Analytics", "→", "Certificates"].map((s, i) => (
              <span key={i} className={s === "→" ? "text-white/20" : "border border-white/10 px-3 py-1.5 rounded-lg"}>
                {s}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <Link
              href="/auth/register/institution"
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 border border-white/15 text-sm px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
