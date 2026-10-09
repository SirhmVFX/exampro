import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/settings" headings={[
      { id: "institution", label: "Institution profile", depth: 2 },
      { id: "branding", label: "Branding", depth: 2 },
      { id: "domain", label: "School domain", depth: 2 },
      { id: "join", label: "Join settings", depth: 2 },
      { id: "vocabulary", label: "Vocabulary", depth: 2 },
      { id: "join-code", label: "Join code rotation", depth: 2 },
      { id: "admin-profile", label: "Admin profile", depth: 2 },
    ]}>
      <DocH1>Settings &amp; branding</DocH1>
      <DocLead>Customise your institution's name, logo, colours, subdomain, join rules, and the words used throughout the product.</DocLead>

      <DocH2 id="institution">Institution profile</DocH2>
      <DocP>Go to <strong>Dashboard → Settings</strong>. Update:</DocP>
      <DocUl>
        <DocLi><strong>Name</strong> — shown in the sidebar, on certificates, and on the school portal.</DocLi>
        <DocLi><strong>Phone</strong> — optional contact number.</DocLi>
        <DocLi><strong>Country</strong> — used for regional formatting.</DocLi>
        <DocLi><strong>Website</strong> — linked from the school portal.</DocLi>
        <DocLi><strong>Address</strong> — appears on certificates.</DocLi>
      </DocUl>

      <DocH2 id="branding">Branding</DocH2>
      <DocUl>
        <DocLi><strong>Logo</strong> — upload a PNG or JPEG. Shown in the dashboard sidebar and on certificates. Recommended: 400×400 px square, transparent background.</DocLi>
        <DocLi><strong>Sidebar colour</strong> — fills the left navigation. Choose from presets or enter any hex. Dark colours work best.</DocLi>
        <DocLi><strong>Accent colour</strong> — used for buttons, active states, and highlights in the white content area. Mid-tones work best.</DocLi>
      </DocUl>
      <Tip>Click a colour swatch to apply a preset instantly. The live preview updates in the sidebar as you pick.</Tip>

      <DocH2 id="domain">School domain</DocH2>
      <DocP>Set a subdomain so your institution has a branded entry point instead of a generic ExamPro URL.</DocP>
      <div className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-emerald-300 my-4">
        northridge.exampro.io
      </div>
      <DocP>The subdomain field auto-slugifies what you type (lowercase, hyphens for spaces). After saving, share the portal URL with your students — they can log in and register from there.</DocP>
      <Note>Wildcard DNS (<code className="bg-white/8 px-1 rounded text-xs">*.exampro.io</code>) must point to the hosting server for custom subdomains to resolve. If you&apos;re self-hosting, add this record yourself.</Note>

      <DocH2 id="join">Join settings</DocH2>
      <DocP>Control who can join from <strong>Join mode</strong>:</DocP>
      <DocUl>
        <DocLi><strong>Join code</strong> — default. Anyone with the code can register.</DocLi>
        <DocLi><strong>Open</strong> — no code required. Anyone who visits the portal can register.</DocLi>
        <DocLi><strong>Invite only</strong> — only people with a matching invite record can register.</DocLi>
        <DocLi><strong>Domain</strong> — only emails from your allowed domains can register.</DocLi>
      </DocUl>
      <DocP><strong>Allowed email domains</strong> — enter comma-separated domains (e.g. <code className="bg-white/8 px-1 rounded text-xs">school.edu.ng, academy.com</code>). Used as the restriction in domain mode, and as an extra check in other modes.</DocP>

      <DocH2 id="vocabulary">Vocabulary</DocH2>
      <DocP>Rename the three core words used throughout the product. Changes take effect immediately for all users.</DocP>
      <DocUl>
        <DocLi><strong>Student</strong> → Learner, Participant, Candidate</DocLi>
        <DocLi><strong>Teacher</strong> → Instructor, Facilitator, Trainer, Tutor</DocLi>
        <DocLi><strong>Class</strong> → Cohort, Grade, Level, Track, Group</DocLi>
      </DocUl>
      <Tip>These changes update every label: nav items, table headers, export column names, and the onboarding wizard for new users.</Tip>

      <DocH2 id="join-code">Join code rotation</DocH2>
      <DocP>Click <strong>Rotate code</strong> in the Join code card. A confirmation dialog warns you the old code will stop working. Confirm to generate a new 6-character code.</DocP>
      <Warning>Existing users are not affected by rotation — only new registrations need the new code. Notify people who haven't joined yet.</Warning>

      <DocH2 id="admin-profile">Admin profile</DocH2>
      <DocP>Update your display name in the Admin profile card. Your email address is shown read-only — it cannot be changed from Settings.</DocP>
    </DocPage>
  );
}
