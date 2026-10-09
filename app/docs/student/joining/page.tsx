import Link from "next/link";
import { DocPage, DocH1, DocH2, DocLead, DocP, Steps, Step, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/joining" headings={[
      { id: "get-code", label: "Get your join code", depth: 2 },
      { id: "register", label: "Register", depth: 2 },
      { id: "sso", label: "Google / Microsoft sign-in", depth: 2 },
      { id: "login", label: "Logging in next time", depth: 2 },
    ]}>
      <DocH1>Joining as a student</DocH1>
      <DocLead>You need a 6-character join code from your school before you can create an account. The whole process takes under 2 minutes.</DocLead>

      <DocH2 id="get-code">Get your join code</DocH2>
      <DocP>Ask your teacher or school admin. The join code is usually shared in class, via WhatsApp, or by email. It looks like <code className="bg-white/8 px-1 rounded text-xs font-mono">K7MQ2P</code> — always 6 characters.</DocP>
      <Note>If your school has a custom portal (e.g. <strong>northridge.exampro.io</strong>), go there instead — the join code is pre-filled and you can register directly.</Note>

      <DocH2 id="register">Register</DocH2>
      <Steps>
        <Step n={1} title="Open the student registration page"><Link href="/auth/register/student" className="text-blue-400 underline font-medium">/auth/register/student</Link></Step>
        <Step n={2} title="Enter your join code">Type the 6-character code and click <strong>Verify</strong>. You&apos;ll see your institution&apos;s name — confirm it&apos;s correct.</Step>
        <Step n={3} title="Choose your class">Select from the classes your school has set up. If your class isn&apos;t listed, ask your admin to add it in Structure.</Step>
        <Step n={4} title="Fill in your details">Full name, email address, and a password (minimum 8 characters).</Step>
        <Step n={5} title="Submit">You&apos;re registered and logged in. You land directly on your student dashboard.</Step>
      </Steps>
      <Tip>Use an email address you check regularly — result notifications and password resets go there.</Tip>

      <DocH2 id="sso">Google / Microsoft sign-in</DocH2>
      <DocP>If your school has enabled SSO, you&apos;ll see <strong>Continue with Google</strong> or <strong>Continue with Microsoft</strong> buttons. Click one, authenticate with your school account, and you&apos;re in — no password to remember. You still need the join code for the first registration.</DocP>

      <DocH2 id="login">Logging in next time</DocH2>
      <DocP>Go to <Link href="/auth/login" className="text-blue-400 underline">/auth/login</Link> (or your school&apos;s portal URL). Enter your email and password. Tick <strong>Remember me for 30 days</strong> on shared devices to stay logged in.</DocP>
      <DocP>If you forget your password, click <strong>Forgot password?</strong> on the login page — a reset link arrives within a minute.</DocP>
    </DocPage>
  );
}
