import Link from "next/link";
import { DocPage, DocH1, DocH2, DocLead, DocP, Steps, Step, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/parent/linking" headings={[
      { id: "register", label: "Creating a parent account", depth: 2 },
      { id: "multiple", label: "Linking multiple children", depth: 2 },
      { id: "switching", label: "Switching between children", depth: 2 },
    ]}>
      <DocH1>Linking a child</DocH1>
      <DocLead>Create a parent account using your child's school join code, then link to their registered email.</DocLead>

      <DocH2 id="register">Creating a parent account</DocH2>
      <Steps>
        <Step n={1} title="Get the join code">Ask your child's school admin for the same join code your child used.</Step>
        <Step n={2} title="Go to parent registration"><Link href="/auth/register/parent" className="text-blue-400 underline font-medium">/auth/register/parent</Link></Step>
        <Step n={3} title="Enter the join code">Verify the code — confirm the institution name is correct.</Step>
        <Step n={4} title="Fill in your details">Your full name, your email address, and a password.</Step>
        <Step n={5} title="Enter your child's email">Type the email address your child used when they registered on ExamPro. The system links your account to theirs.</Step>
        <Step n={6} title="You're in">You land on the parent dashboard showing your child's upcoming assessments and results.</Step>
      </Steps>
      <Warning>Your child must already have an ExamPro account before you can link to them. If they haven&apos;t registered yet, ask them to do so first — then come back and register as a parent.</Warning>

      <DocH2 id="multiple">Linking multiple children</DocH2>
      <DocP>If you have more than one child at the same institution, you can link to multiple children from your parent account. After logging in, go to your <strong>Profile</strong> settings and add the additional child&apos;s email address.</DocP>
      <Note>Each child must be registered with a different email address. If two of your children share an email, ask the school admin to update one of them.</Note>

      <DocH2 id="switching">Switching between children</DocH2>
      <DocP>A child selector dropdown appears at the top of the parent dashboard when you&apos;re linked to more than one child. Select a name to switch to their view.</DocP>
      <Tip>If your children are at different institutions, you need a separate parent account for each institution — one per join code.</Tip>
    </DocPage>
  );
}
