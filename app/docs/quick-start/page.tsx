import Link from "next/link";
import { DocPage, DocH1, DocH2, DocLead, DocP, Steps, Step, Note, Tip, CardGrid, Card } from "../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/quick-start" headings={[
      { id: "admin-path", label: "Admin — set up your school", depth: 2 },
      { id: "teacher-path", label: "Teacher — first assessment", depth: 2 },
      { id: "student-path", label: "Student — take your first exam", depth: 2 },
      { id: "next-steps", label: "Next steps", depth: 2 },
    ]}>
      <DocH1>Quick start</DocH1>
      <DocLead>Get from zero to a live exam in under 10 minutes. Pick your role below.</DocLead>

      <DocH2 id="admin-path">Admin — set up your school</DocH2>
      <Steps>
        <Step n={1} title="Register your institution">
          Go to <Link href="/auth/register/institution" className="text-blue-400 underline font-medium">Register</Link> and fill in your name, email, and password — then your institution name, type, and country.
        </Step>
        <Step n={2} title="Complete the 3-step onboarding wizard">
          <ul className="mt-2 space-y-1.5 list-disc list-inside text-white/60">
            <li><strong>Structure</strong> — add at least one class and one subject.</li>
            <li><strong>Branding</strong> — upload your logo and pick a sidebar colour.</li>
            <li><strong>Invite teachers</strong> — paste emails or skip for now.</li>
          </ul>
        </Step>
        <Step n={3} title="Copy your join code">
          After onboarding you land on your admin dashboard. Your join code appears on the Overview and in Settings. Share it with your teachers and students.
        </Step>
        <Step n={4} title="Watch as people join">
          As teachers and students register using your code, they appear on the Teachers and Students pages. You can suspend, edit, or delete them at any time.
        </Step>
      </Steps>
      <Tip>The whole onboarding takes about 3 minutes. Classes and subjects can be changed later — don&apos;t let perfecting them slow you down.</Tip>

      <DocH2 id="teacher-path">Teacher — first assessment</DocH2>
      <Steps>
        <Step n={1} title="Register as a teacher">
          Go to <Link href="/auth/register/teacher" className="text-blue-400 underline font-medium">Teacher sign-up</Link>, enter the join code your admin gave you, fill in your name and email, and set a password.
        </Step>
        <Step n={2} title="Create a question">
          Dashboard → <strong>Questions → New question</strong>. Choose MCQ, type your question text, add 4 options, mark the correct one, and save.
        </Step>
        <Step n={3} title="Create an assessment">
          Dashboard → <strong>Assessments → New assessment</strong>. Give it a title, pick the subject and class, set a duration, and add the question you just created.
        </Step>
        <Step n={4} title="Publish it">
          Change the status from <strong>Draft</strong> to <strong>Published</strong>. Students in that class can now see and take it.
        </Step>
      </Steps>
      <Note>Students must be in the same class as the assessment targets. If a student can&apos;t see it, check their class assignment in the admin Students page.</Note>

      <DocH2 id="student-path">Student — take your first exam</DocH2>
      <Steps>
        <Step n={1} title="Register as a student">
          Go to <Link href="/auth/register/student" className="text-blue-400 underline font-medium">Student sign-up</Link>, enter the join code, fill in your name and email, choose your class, and set a password.
        </Step>
        <Step n={2} title="Find the assessment">
          Dashboard → <strong>Assessments</strong>. Published assessments for your class appear here.
        </Step>
        <Step n={3} title="Take it">
          Click the assessment, read the instructions, then click <strong>Start</strong>. Answer questions — your work saves automatically every 12 seconds.
        </Step>
        <Step n={4} title="Submit and see results">
          Click <strong>Submit</strong> when done (or let the timer expire). If instant results are enabled you&apos;ll see your score immediately.
        </Step>
      </Steps>

      <DocH2 id="next-steps">Next steps</DocH2>
      <CardGrid>
        <Card title="AI question generation" desc="Let Gemini draft MCQ, essay, or coding questions for your topic." href="/docs/teacher/ai" />
        <Card title="Coding playground" desc="Set up a JavaScript question with test cases — auto-graded in the browser." href="/docs/reference/question-types" />
        <Card title="Integrity settings" desc="Enable tab-switch warnings, webcam, and confirm-on-leave." href="/docs/teacher/integrity" />
        <Card title="Learning paths" desc="Gate an exam behind a material — students must read before they test." href="/docs/teacher/paths" />
        <Card title="Analytics" desc="See pass rates by class, subject, and teacher." href="/docs/admin/analytics" />
        <Card title="Certificates" desc="Issue a verifiable certificate to a student." href="/docs/admin/certificates" />
      </CardGrid>
    </DocPage>
  );
}
