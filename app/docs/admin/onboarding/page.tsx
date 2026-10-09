import Link from "next/link";
import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, Steps, Step, Note, Tip, Warning, Code } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/onboarding" headings={[
      { id: "register", label: "Register your institution", depth: 2 },
      { id: "wizard", label: "Onboarding wizard", depth: 2 },
      { id: "structure-step", label: "Step 1 — Structure", depth: 3 },
      { id: "branding-step", label: "Step 2 — Branding", depth: 3 },
      { id: "invite-step", label: "Step 3 — Invite teachers", depth: 3 },
      { id: "after", label: "After onboarding", depth: 2 },
    ]}>
      <DocH1>Admin onboarding</DocH1>
      <DocLead>Register your institution and complete the onboarding wizard. The whole process takes about 3 minutes.</DocLead>

      <DocH2 id="register">Register your institution</DocH2>
      <Steps>
        <Step n={1} title="Open the registration page">
          Navigate to <Link href="/auth/register/institution" className="text-blue-400 underline font-medium">/auth/register/institution</Link>.
        </Step>
        <Step n={2} title="Create your admin account">
          Enter your full name, work email address, and a strong password (minimum 8 characters).
        </Step>
        <Step n={3} title="Describe your institution">
          Fill in:
          <ul className="mt-2 space-y-1 list-disc list-inside text-white/60">
            <li><strong>Institution name</strong> — exactly as you want it displayed to students.</li>
            <li><strong>Type</strong> — K-12, university, training centre, corporate, tutoring, faith, or other.</li>
            <li><strong>Country</strong> and optional phone number.</li>
          </ul>
        </Step>
        <Step n={4} title="Submit">
          ExamPro creates your institution, logs you in, and redirects you to the onboarding wizard.
        </Step>
      </Steps>
      <Note>Your email address becomes your permanent admin login. It cannot be changed later — so use a work address, not a personal one.</Note>

      <DocH2 id="wizard">Onboarding wizard</DocH2>
      <DocP>The wizard has three steps. You must complete them in order, but you can come back and change everything in Settings afterward.</DocP>

      <DocH3 id="structure-step">Step 1 — Structure</DocH3>
      <DocP>Define the groups and courses your institution uses. Every assessment, question, and student will reference these.</DocP>
      <ul className="space-y-3 my-4">
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">What do you call a group?</p>
          <p className="text-sm text-white/50">Choose a label: <strong>Class</strong>, <strong>Grade</strong>, <strong>Level</strong>, <strong>Cohort</strong>, <strong>Track</strong>. This word appears throughout the product. You can change it later in Settings.</p>
        </li>
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">Groups</p>
          <p className="text-sm text-white/50">Type a name and press Enter to add it. Examples: <em>Grade 10</em>, <em>JSS 2</em>, <em>Cohort A</em>, <em>Frontend Track</em>. Add as many as you need.</p>
        </li>
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">Subjects</p>
          <p className="text-sm text-white/50">The courses or disciplines: <em>Mathematics</em>, <em>English</em>, <em>React</em>, <em>Compliance 101</em>. Teachers tag every question and assessment with a subject.</p>
        </li>
      </ul>
      <Tip>Add at least one group and one subject to continue. You can add more from <strong>Dashboard → Structure</strong> at any time.</Tip>

      <DocH3 id="branding-step">Step 2 — Branding</DocH3>
      <DocP>Customise how your institution looks to students and teachers.</DocP>
      <ul className="space-y-3 my-4">
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">Logo</p>
          <p className="text-sm text-white/50">Upload a PNG or JPEG. Appears in the dashboard sidebar and on certificates. Recommended size: 400×400 px or larger square.</p>
        </li>
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">Sidebar colour</p>
          <p className="text-sm text-white/50">Pick from presets or enter a hex code. This fills the left navigation sidebar on every dashboard page.</p>
        </li>
        <li className="border border-white/10 rounded-xl p-4">
          <p className="font-semibold text-sm text-white mb-1">Accent colour</p>
          <p className="text-sm text-white/50">Used for buttons and highlights in the white workspace area.</p>
        </li>
      </ul>

      <DocH3 id="invite-step">Step 3 — Invite teachers</DocH3>
      <DocP>Paste email addresses (one per line or comma-separated) to send invites. These create pending invite records — teachers still need to register using your join code.</DocP>
      <DocP>You can skip this step entirely and invite people later from <strong>Dashboard → Teachers</strong>.</DocP>

      <DocH2 id="after">After onboarding</DocH2>
      <DocP>You land on your admin dashboard. From here:</DocP>
      <ul className="space-y-2 mt-4">
        {[
          ["Your join code is on the Overview page", "Share it with teachers and students so they can register."],
          ["Check Settings", "Add your subdomain (e.g. yourschool.exampro.io) so you have a branded URL."],
          ["Import a roster", "Use Dashboard → Import to bulk-add students from a CSV."],
          ["Invite teachers", "Dashboard → Teachers → Invite."],
        ].map(([title, desc]) => (
          <li key={String(title)} className="flex items-start gap-3 text-sm">
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
            <span><strong>{title}.</strong> {desc}</span>
          </li>
        ))}
      </ul>
      <Warning>The onboarding wizard only runs once. After completing it, all changes are made through the individual admin dashboard pages.</Warning>
    </DocPage>
  );
}
