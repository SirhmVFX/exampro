import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, CardGrid, Card, DocTable } from "../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/introduction" headings={[
      { id: "what-is-exampro", label: "What is ExamPro?", depth: 2 },
      { id: "how-it-works", label: "How it works", depth: 2 },
      { id: "five-roles", label: "Five roles", depth: 2 },
      { id: "key-concepts", label: "Key concepts", depth: 2 },
      { id: "tech-stack", label: "Tech stack", depth: 2 },
    ]}>
      <DocH1>Introduction</DocH1>
      <DocLead>ExamPro is a cloud-based multi-tenant assessment platform for educational institutions. One workspace per school — admins run it, teachers set work, students take it.</DocLead>

      <DocH2 id="what-is-exampro">What is ExamPro?</DocH2>
      <DocP>ExamPro gives every institution its own isolated workspace with a custom portal, join code, branding, and data. Nothing is shared between institutions at the database level.</DocP>
      <DocP>It covers the full assessment lifecycle:</DocP>
      <DocUl>
        <DocLi><strong>Admin</strong> — onboards the institution, invites staff and students, manages billing, views analytics.</DocLi>
        <DocLi><strong>Teacher</strong> — builds a question library (manually or with AI), creates assessments, grades submissions.</DocLi>
        <DocLi><strong>Student</strong> — takes timed exams, completes materials, tracks progress, earns certificates.</DocLi>
        <DocLi><strong>Parent</strong> — read-only view of their child's schedule and results.</DocLi>
        <DocLi><strong>Manager</strong> — sees completion status for their department.</DocLi>
      </DocUl>

      <DocH2 id="how-it-works">How it works</DocH2>
      <DocTable
        headers={["Step", "Who", "What happens"]}
        rows={[
          ["1", "Admin", "Registers institution, completes onboarding (structure + branding + invites)"],
          ["2", "Admin", "Shares join code with teachers and students"],
          ["3", "Teacher", "Creates question library, builds assessments, publishes them"],
          ["4", "Student", "Takes the exam in the browser — answers autosaved every 12 s"],
          ["5", "Platform", "MCQ/TF auto-graded instantly; essays/projects flagged for manual review"],
          ["6", "Teacher", "Grades manual questions, adds feedback"],
          ["7", "Admin", "Views gradebook and analytics; issues certificates"],
        ]}
      />

      <DocH2 id="five-roles">Five roles</DocH2>
      <CardGrid>
        <Card title="Admin" desc="Full control — billing, roster, branding, analytics, certificates, audit log." href="/docs/admin/onboarding" />
        <Card title="Teacher" desc="Question library, AI generation, assessments, grading, materials, rubrics." href="/docs/teacher/getting-started" />
        <Card title="Student" desc="Take exams, view results, track progress, earn certificates." href="/docs/student/joining" />
        <Card title="Parent" desc="Read-only view of linked child's upcoming assessments and results." href="/docs/parent/linking" />
        <Card title="Manager" desc="Department-scoped view of who has completed what." href="/docs/roles" />
      </CardGrid>

      <DocH2 id="key-concepts">Key concepts</DocH2>
      <DocTable
        headers={["Concept", "Description"]}
        rows={[
          ["Institution", "A single tenant — one school, bootcamp, or company. All data is scoped to it."],
          ["Join code", "A 6-character code that gates who can register into your institution."],
          ["Class / Cohort", "A group of students. Admins name them whatever fits (Grade 10, Cohort A, etc.)."],
          ["Subject", "The course or discipline a question or assessment belongs to."],
          ["Attempt", "One sitting of an assessment by one student. Stores answers, score, and events."],
          ["Learning path", "An ordered sequence of materials and assessments with optional gating."],
          ["Term", "A time period (First Term, Fall 2026) used to filter the gradebook."],
        ]}
      />

      <DocH2 id="tech-stack">Tech stack</DocH2>
      <DocTable
        headers={["Layer", "Technology"]}
        rows={[
          ["Frontend", "Next.js 15 App Router, React 19, Tailwind CSS v4"],
          ["Auth", "Firebase Authentication (email/password, Google SSO, Microsoft SSO)"],
          ["Database", "Cloud Firestore (NoSQL, real-time, multi-tenant by institutionId)"],
          ["File storage", "Cloudinary (materials, logos, editor images)"],
          ["AI", "Google Gemini via REST API (question generation)"],
          ["Payments", "Paystack (NGN / USD)"],
          ["Email", "Resend (contact form)"],
          ["Hosting", "Vercel (recommended)"],
        ]}
      />
      <Note>You don&apos;t need to know any of this to use ExamPro. It&apos;s here for developers who want to understand what&apos;s running under the hood.</Note>
    </DocPage>
  );
}
