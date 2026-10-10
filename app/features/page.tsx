import Link from "next/link";
import {
  Brain,
  Code2,
  BarChart3,
  Shield,
  BookOpen,
  FileText,
  Users,
  Bell,
  Award,
  Layers,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

const sections = [
  {
    category: "Assessment Engine",
    items: [
      {
        icon: FileText,
        title: "Tests, Quizzes, Exams & Assignments",
        desc: "Create or AI-generate any assessment type — Test, Quiz, Exam, Assignment, Project or Practice — and assign it to a whole class or hand-picked students.",
      },
      {
        icon: Users,
        title: "Admins & teachers, same power",
        desc: "Instructors and administrators both build, generate, publish and assign assessments from a shared question bank — exactly the Bridgitus Test/Exam/Quiz workflow.",
      },
      {
        icon: FileText,
        title: "6 question types",
        desc: "MCQ, true/false, short answer, essay, coding playground, and project upload — mix up to 100 questions in one assessment.",
      },
      {
        icon: Zap,
        title: "Instant auto-grading & corrections",
        desc: "MCQ and true/false grade the moment a student submits. Students immediately see their score, what they missed, and step-by-step solutions.",
      },
      {
        icon: Clock,
        title: "Timed, self-paced & trials",
        desc: "Set a countdown or let students work at their own pace. Control the number of trials per student and re-assign the same exam as many times as you need.",
      },
      {
        icon: Code2,
        title: "Coding playground",
        desc: "Students write JavaScript in the browser. A sandboxed Web Worker runs their code against your test cases in real time.",
      },
    ],
  },
  {
    category: "AI & Question Bank",
    items: [
      {
        icon: Brain,
        title: "AI question generation",
        desc: "Describe a subject, topic, and difficulty. Google Gemini drafts up to 100 questions at a time — MCQ, true/false, short answer, essay, coding, or mixed — with answers and worked solutions.",
      },
      {
        icon: Layers,
        title: "Subject folders & question sets",
        desc: "Every subject gets a folder. Store as many question sets as you need — up to 100 questions per set — and reuse a whole set in any assessment in one click.",
      },
      {
        icon: FileText,
        title: "CSV import & export",
        desc: "Bulk-import questions from a spreadsheet into a set or the library, or export your entire question bank for offline backup.",
      },
      {
        icon: CheckCircle,
        title: "Rubric builder",
        desc: "Create multi-criterion rubrics for essays and projects. Teachers score each criterion separately during grading.",
      },
    ],
  },
  {
    category: "Analytics & Gradebook",
    items: [
      {
        icon: BarChart3,
        title: "Institution-wide analytics",
        desc: "Pass rates by class and subject, teacher performance table, and average scores — all in one view.",
      },
      {
        icon: BarChart3,
        title: "Student progress tracking",
        desc: "Students see their average score, pass rate, and material completion percentage broken down by subject.",
      },
      {
        icon: Award,
        title: "Certificates",
        desc: "Issue verified completion certificates with a public link. Anyone can check authenticity at /verify/code.",
      },
      {
        icon: FileText,
        title: "CSV result export",
        desc: "Download gradebook, question bank, or full student roster as a spreadsheet at any time.",
      },
    ],
  },
  {
    category: "Integrity & Security",
    items: [
      {
        icon: Shield,
        title: "Tab-switch detection",
        desc: "Every time a student leaves the exam tab, the event is logged with a timestamp for teacher review.",
      },
      {
        icon: Shield,
        title: "Webcam presence logging",
        desc: "Webcam feed is shown to the student during the exam. Presence is logged — no recording or upload required.",
      },
      {
        icon: Shield,
        title: "Firestore security rules",
        desc: "Every document is stamped with institutionId. Security rules enforce tenant isolation at the database layer.",
      },
      {
        icon: Shield,
        title: "Audit log",
        desc: "Every admin action — plan changes, certificate issues, roster imports — is written to an append-only audit trail.",
      },
    ],
  },
  {
    category: "Learning Management",
    items: [
      {
        icon: BookOpen,
        title: "Learning materials",
        desc: "Upload PDFs, videos, links, and rich-text notes. Assign to a whole class or to hand-picked students; they mark materials complete and you track progress.",
      },
      {
        icon: Layers,
        title: "Learning paths",
        desc: "Chain materials and assessments into a sequence. Required items gate the next step until the student passes.",
      },
      {
        icon: Bell,
        title: "Announcements",
        desc: "Send rich-text announcements to everyone, just students, just teachers, or a specific person.",
      },
      {
        icon: Users,
        title: "Cohorts & waitlists",
        desc: "Set seat caps on groups. Students join a waitlist when full; admins admit them one by one.",
      },
    ],
  },
  {
    category: "Multi-tenant Platform",
    items: [
      {
        icon: Globe,
        title: "Custom school portal",
        desc: "Each institution gets a branded portal at your-school.exampro.io with your logo and colours.",
      },
      {
        icon: Users,
        title: "5 roles",
        desc: "Admin, teacher, student, parent, and manager — each with a tailored dashboard and access scope.",
      },
      {
        icon: Globe,
        title: "Vocabulary customisation",
        desc: "Rename student → learner, teacher → instructor, class → cohort. Every label in the product updates.",
      },
      {
        icon: CheckCircle,
        title: "Google & Microsoft SSO",
        desc: "Staff and students can sign in with their Google or Microsoft account instead of a password.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <PageHero
        kicker="Features"
        title="Everything you need to run assessments"
        subtitle="From a simple quiz to a proctored coding exam — ExamPro handles the whole workflow."
      />

      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto space-y-20">
          {sections.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/35 mb-8">
                {section.category}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                  >
                    <div className="w-9 h-9 border border-white/15 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <p className="font-semibold text-sm mb-2">{item.title}</p>
                    <p className="text-xs text-white/45 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-6xl mx-auto mt-20 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <h3 className="text-2xl font-semibold mb-3">Ready to see it live?</h3>
          <p className="text-sm text-white/45 mb-8 max-w-md mx-auto">
            Create a free institution in two minutes. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register/institution"
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Start for free <ArrowRight className="w-4 h-4" />
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
