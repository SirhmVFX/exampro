import Link from "next/link";
import {
  DocPage,
  DocH1,
  DocH2,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Steps,
  Step,
  Note,
  Tip,
  CardGrid,
  Card,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/teacher/getting-started"
      headings={[
        { id: "join", label: "Joining your institution", depth: 2 },
        { id: "dashboard", label: "Your dashboard", depth: 2 },
        { id: "first-steps", label: "Recommended first steps", depth: 2 },
      ]}
    >
      <DocH1>Teacher — getting started</DocH1>
      <DocLead>
        Your admin will give you a join code. Registration takes two minutes —
        then you can start building questions immediately.
      </DocLead>

      <DocH2 id="join">Joining your institution</DocH2>
      <Steps>
        <Step n={1} title="Get the join code">
          Ask your school admin for the 6-character join code (e.g.{" "}
          <code className="bg-white/8 px-1 rounded text-xs">K7MQ2P</code>). They
          find it on their Overview page or in Settings.
        </Step>
        <Step n={2} title="Go to teacher registration">
          <Link
            href="/auth/register/teacher"
            className="text-blue-400 underline font-medium"
          >
            /auth/register/teacher
          </Link>
        </Step>
        <Step n={3} title="Verify the code">
          Enter the join code. You&apos;ll see your institution&apos;s name —
          confirm it&apos;s correct before continuing.
        </Step>
        <Step n={4} title="Fill in your details">
          Enter your full name, email, and a password. Your admin may have
          pre-imported your email — if so, your class/subject assignments are
          already waiting.
        </Step>
        <Step n={5} title="You're in">
          You land on your teacher dashboard. If you don&apos;t see the right
          classes or subjects in dropdowns, ask your admin to update your
          profile.
        </Step>
      </Steps>
      <Note>
        If your institution uses Google or Microsoft SSO, click the SSO button
        instead of filling in a password. You&apos;ll still need the join code.
      </Note>

      <DocH2 id="dashboard">Your dashboard</DocH2>
      <DocP>
        Your teacher dashboard has these sections in the left sidebar:
      </DocP>
      <DocUl>
        <DocLi>
          <strong>Overview</strong> — stats (questions, assessments, materials,
          submissions needing grading), and recent activity.
        </DocLi>
        <DocLi>
          <strong>Questions</strong> — your question library. Create, edit,
          delete, import, and AI-generate questions here.
        </DocLi>
        <DocLi>
          <strong>Assessments</strong> — all your assessments, with sidebar
          shortcuts for each type:{" "}
          <strong>Quizzes, Tests, Exams, Assignments, Projects,</strong> and{" "}
          <strong>Practice</strong>. Create, publish, close, edit, and view
          results.
        </DocLi>
        <DocLi>
          <strong>Submissions</strong> — every student attempt. Filter by status
          (needs grading, graded).
        </DocLi>
        <DocLi>
          <strong>Materials</strong> — upload documents, videos, and notes for
          students.
        </DocLi>
        <DocLi>
          <strong>Rubrics</strong> — build scoring rubrics for essay and project
          questions.
        </DocLi>
        <DocLi>
          <strong>Analytics</strong> — pass rates for your assessments and
          classes.
        </DocLi>
        <DocLi>
          <strong>Students</strong> — list of students in your classes.
        </DocLi>
      </DocUl>
      <Tip>
        Prefer a darker workspace? Use the <strong>theme toggle</strong> in the
        top bar (sun/moon icon) to switch between light and dark mode — your
        choice is remembered on this device. Every page, dialog, and picker
        follows the theme.
      </Tip>

      <DocH2 id="first-steps">Recommended first steps</DocH2>
      <CardGrid>
        <Card
          title="Build your question library"
          desc="Create questions by hand, import a CSV, or generate up to 100 with AI — organised into subject folders."
          href="/docs/teacher/questions"
        />
        <Card
          title="Create your first assessment"
          desc="Quiz, test, exam, or assignment — publish one in under 5 minutes."
          href="/docs/teacher/assessments"
        />
        <Card
          title="Upload a material"
          desc="Add a reading or video and link it as a prerequisite to your assessment."
          href="/docs/teacher/materials"
        />
        <Card
          title="Set up integrity"
          desc="Enable tab-switch warnings for exam-level assessments."
          href="/docs/teacher/integrity"
        />
      </CardGrid>
    </DocPage>
  );
}
