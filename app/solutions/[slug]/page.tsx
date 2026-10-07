import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import type { Metadata } from "next";
import { MarketingShell, PageHero } from "@/app/components/marketing/shell";

interface SolutionPage {
  title: string;
  kicker: string;
  subtitle: string;
  bullets: string[];
  cta: string;
}

const pages: Record<string, SolutionPage> = {
  k12: {
    kicker: "K-12 Schools",
    title: "Assessments built for primary and secondary schools",
    subtitle: "Class-based structure, parent visibility, timed exams, and results the moment a paper is submitted.",
    bullets: [
      "Organise students into classes (or grades, levels — you choose the word)",
      "Teachers set quizzes, tests, and end-of-term exams with a timer",
      "MCQ and true/false grade instantly; essays go to the teacher",
      "Parents link to their child's account and see results read-only",
      "Admin sees pass rates by class and subject on one screen",
      "Certificates issued for term completion or special achievements",
    ],
    cta: "Set up your school",
  },
  university: {
    kicker: "Universities & Colleges",
    title: "Assessment management for higher education",
    subtitle: "Faculties, departments, multi-sitting exams, essay rubrics — built for the complexity of university life.",
    bullets: [
      "Departments and faculties as first-class concepts",
      "Manager role lets HODs see their department's completion status",
      "Custom rubrics for essay and project marking",
      "Multiple exam sittings with per-attempt attempt limits",
      "Gradebook filters by term and subject — export to Excel",
      "Custom subdomain: youruni.exampro.io",
    ],
    cta: "Register your institution",
  },
  training: {
    kicker: "Training Centres & Bootcamps",
    title: "Run cohort-based technical training end-to-end",
    subtitle: "Learning paths, coding playgrounds, certificates your graduates can share on LinkedIn.",
    bullets: [
      "Cohort-based structure with seat caps and waitlists",
      "Learning paths: sequence materials and assessments, gate progress",
      "Coding playground — JavaScript in a sandboxed browser environment",
      "AI generates coding challenges from a topic description",
      "Certificates with public verify links for employer proof",
      "Export full roster and results at graduation",
    ],
    cta: "Start your bootcamp",
  },
  corporate: {
    kicker: "Corporate L&D",
    title: "Skills assessments and compliance training at scale",
    subtitle: "Departments, manager dashboards, and completion reports — without the enterprise price tag.",
    bullets: [
      "Departments map to your org chart; managers see their team only",
      "Assign training to specific people or whole departments",
      "Completion tracking for compliance and audit purposes",
      "CSV export for HR systems and compliance reports",
      "Join mode options: open, invite-only, domain-restricted",
      "Audit log of every admin action for internal governance",
    ],
    cta: "Try it for your team",
  },
  tutoring: {
    kicker: "Tutoring Centres",
    title: "Practice exams that actually prepare students",
    subtitle: "Small groups, instant results, and progress charts that show exactly what to work on next.",
    bullets: [
      "Practice mode lets students take unlimited attempts",
      "Immediate results with per-question explanations",
      "Subject-by-subject progress charts for students and tutors",
      "Parent accounts see upcoming sessions and latest scores",
      "AI generates differentiated practice questions by difficulty",
      "No IT setup — students sign in on any device with a join code",
    ],
    cta: "Set up your centre",
  },
  faith: {
    kicker: "Faith & Community",
    title: "Structured learning for religious and community groups",
    subtitle: "Bible studies, confirmation classes, or any group that needs quizzes, tracking, and certificates.",
    bullets: [
      "Free plan covers up to 30 participants — enough for most groups",
      "Simple join code — no IT skills required to get started",
      "True/false and MCQ for scripture knowledge quizzes",
      "Short-answer questions for reflection and comprehension",
      "Certificates of completion for confirmation or study programmes",
      "Announcements keep the whole group informed",
    ],
    cta: "Start for free",
  },
  admins: {
    kicker: "For Administrators",
    title: "Full institutional control in one dashboard",
    subtitle: "Onboard staff, manage billing, track performance, and keep everything running — without touching a spreadsheet.",
    bullets: [
      "Roster management: invite teachers and students by email or CSV",
      "Custom branding: logo, colours, and school portal subdomain",
      "Institution-wide analytics: pass rates, subject breakdowns, teacher performance",
      "Announcements targeted by role or specific person",
      "Certificates issued in two clicks with public verify links",
      "Audit log of every admin action across the institution",
    ],
    cta: "Register your institution",
  },
  teachers: {
    kicker: "For Teachers",
    title: "Build, run, and grade faster",
    subtitle: "A question library, AI generation, and a grading interface that doesn't slow you down.",
    bullets: [
      "AI generates MCQ, essay, or coding questions from a topic in seconds",
      "Question library: save once, reuse across any assessment",
      "6 question types including a live coding playground",
      "Publish an assessment in under 5 minutes",
      "Grading interface with per-question point override and feedback",
      "Analytics show which questions students struggled with most",
    ],
    cta: "Join as a teacher",
  },
  students: {
    kicker: "For Students",
    title: "A clean exam experience — results in seconds",
    subtitle: "No app to install. Sign in with a join code, take the exam, see your results.",
    bullets: [
      "Answers autosave every 12 seconds — internet drops won't lose your work",
      "Countdown timer with accommodation for extra time",
      "Coding playground with live test case feedback",
      "Results with per-question breakdown immediately after submission",
      "Progress view: average score and pass rate per subject",
      "Certificates with a public link to share with employers",
    ],
    cta: "Sign up as a student",
  },
  parents: {
    kicker: "For Parents",
    title: "Stay informed without getting in the way",
    subtitle: "See your child's upcoming exams and results — read-only, no disruption to their account.",
    bullets: [
      "Link to your child's account using their registered email",
      "See all upcoming assessments with subject and scheduled time",
      "View results as soon as they're graded",
      "Switch between children if you have more than one enrolled",
      "No access to question content — only outcomes",
      "Takes two minutes to set up",
    ],
    cta: "Create a parent account",
  },
};

const ctaHrefs: Record<string, string> = {
  admins:   "/auth/register/institution",
  teachers: "/auth/register/teacher",
  students: "/auth/register/student",
  parents:  "/auth/register/parent",
};

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) return {};
  return { title: `${page.title} — ExamPro`, description: page.subtitle };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  const ctaHref = ctaHrefs[slug] ?? "/auth/register/institution";

  return (
    <MarketingShell>
      <PageHero kicker={page.kicker} title={page.title} subtitle={page.subtitle} />

      <section className="px-6 pb-28">
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-4 mb-12">
            {page.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              {page.cta} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 border border-white/15 text-sm px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              All solutions
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
