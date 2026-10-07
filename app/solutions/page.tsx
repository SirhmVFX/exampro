import Link from "next/link";
import { ArrowRight, GraduationCap, Building2, Briefcase, BookOpen, Users, Globe } from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const byInstitution = [
  {
    icon: GraduationCap,
    title: "K-12 Schools",
    href: "/solutions/k12",
    desc: "Class-based structure, parent access, timed exams, and results the moment a paper is submitted.",
    tag: "Primary & secondary",
  },
  {
    icon: Building2,
    title: "Universities & Colleges",
    href: "/solutions/university",
    desc: "Departments, faculties, multiple exam sittings, and essay questions graded with custom rubrics.",
    tag: "Higher education",
  },
  {
    icon: Briefcase,
    title: "Training Centres & Bootcamps",
    href: "/solutions/training",
    desc: "Cohort-based learning paths, coding playgrounds, and certificates your graduates can share publicly.",
    tag: "Professional training",
  },
  {
    icon: BookOpen,
    title: "Corporate L&D",
    href: "/solutions/corporate",
    desc: "Departments, manager dashboards, and completion reports for compliance and skills training.",
    tag: "Corporate",
  },
  {
    icon: Users,
    title: "Tutoring Centres",
    href: "/solutions/tutoring",
    desc: "Small groups, practice assessments, instant results, and progress charts parents can see.",
    tag: "Supplementary",
  },
  {
    icon: Globe,
    title: "Faith & Community",
    href: "/solutions/faith",
    desc: "Bible studies, confirmation classes, or any group that needs structured quizzes and progress tracking.",
    tag: "Community",
  },
];

const byRole = [
  {
    title: "For Administrators",
    href: "/solutions/admins",
    desc: "Full institutional control — roster import, billing, analytics, announcements, certificates, and audit logs.",
    bullets: ["Invite teachers and students by CSV", "Custom branding and school portal URL", "Institution-wide pass rate analytics", "Plan management via Paystack"],
  },
  {
    title: "For Teachers",
    href: "/solutions/teachers",
    desc: "Build, run, and grade assessments faster — with AI doing the heavy lifting on question creation.",
    bullets: ["AI question generation with Gemini", "6 question types including coding", "Manual grading with rubrics", "Per-student submission review"],
  },
  {
    title: "For Students",
    href: "/solutions/students",
    desc: "A clean, distraction-free exam experience — with instant results, progress charts, and certificates.",
    bullets: ["Timed exams with autosave", "Coding playground with live test cases", "Subject-by-subject progress view", "Download completion certificates"],
  },
  {
    title: "For Parents",
    href: "/solutions/parents",
    desc: "See your child's upcoming exams and results without needing your own exam account.",
    bullets: ["Link to child by email", "View all upcoming assessments", "See results as they come in", "Read-only access — nothing to break"],
  },
];

export default function SolutionsPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Solutions"
        title="Built for every kind of institution"
        subtitle="K-12, university, bootcamp, corporate — ExamPro adapts its vocabulary, structure, and features to how you actually work."
      />

      {/* By institution type */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/35 mb-8">By institution type</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {byInstitution.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group border border-white/10 rounded-2xl p-7 hover:border-white/25 hover:bg-white/[0.02] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-9 h-9 border border-white/15 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-white/30 mt-1">{item.tag}</span>
                </div>
                <p className="font-semibold mb-2">{item.title}</p>
                <p className="text-sm text-white/45 leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-white/40 group-hover:text-white transition-colors">
                  Learn more <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* By role */}
      <section className="px-6 pb-28 border-t border-white/10 pt-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white/35 mb-8">By role</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {byRole.map((item) => (
              <div key={item.title} className="border border-white/10 rounded-2xl p-7">
                <p className="font-semibold text-lg mb-2">{item.title}</p>
                <p className="text-sm text-white/45 leading-relaxed mb-5">{item.desc}</p>
                <ul className="space-y-2 mb-6">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="w-1 h-1 rounded-full bg-white/30 mt-2 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
                >
                  See how it works <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
