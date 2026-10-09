import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Warning, CodeBlock } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/inviting" headings={[
      { id: "join-code", label: "Join code", depth: 2 },
      { id: "csv-import", label: "CSV roster import", depth: 2 },
      { id: "direct-invite", label: "Direct invite", depth: 2 },
      { id: "join-modes", label: "Join modes", depth: 2 },
      { id: "suspending", label: "Suspending & removing", depth: 2 },
    ]}>
      <DocH1>Inviting people</DocH1>
      <DocLead>Three ways to get teachers and students into your institution — join code, CSV import, or direct invite.</DocLead>

      <DocH2 id="join-code">Join code</DocH2>
      <DocP>Your institution has a unique 6-character join code visible on the Overview page and in Settings. Share it with anyone who needs to register.</DocP>
      <DocUl>
        <DocLi>Teachers go to <strong>/auth/register/teacher</strong>, enter the code, and register.</DocLi>
        <DocLi>Students go to <strong>/auth/register/student</strong>, enter the code, and register.</DocLi>
        <DocLi>Parents go to <strong>/auth/register/parent</strong>, enter the code, then link to their child&apos;s email.</DocLi>
      </DocUl>
      <Tip>Rotate the join code in <strong>Settings → Join code → Rotate</strong> to invalidate old codes without affecting existing users.</Tip>

      <DocH2 id="csv-import">CSV roster import</DocH2>
      <DocP>Go to <strong>Dashboard → Import</strong>. Upload a CSV to create pending invite records for multiple people at once. When they register using the join code, the system matches them automatically and assigns their class.</DocP>

      <DocH3 id="csv-format">CSV format</DocH3>
      <CodeBlock lang="csv">{`name,email,role,className
Amara Okafor,amara@school.edu.ng,student,Grade 10
Tunde Adeyemi,tunde@school.edu.ng,student,Grade 11
Mrs. Kemi Fasola,kemi@school.edu.ng,teacher,
`}</CodeBlock>
      <DocUl>
        <DocLi><strong>name</strong> — required. Full name.</DocLi>
        <DocLi><strong>email</strong> — required. Must match the email they register with.</DocLi>
        <DocLi><strong>role</strong> — required. One of: <code className="bg-white/8 px-1 rounded text-xs">student</code>, <code className="bg-white/8 px-1 rounded text-xs">teacher</code>, <code className="bg-white/8 px-1 rounded text-xs">parent</code>, <code className="bg-white/8 px-1 rounded text-xs">manager</code>.</DocLi>
        <DocLi><strong>className</strong> — optional. Must exactly match a class name in your Structure. Leave blank for teachers.</DocLi>
      </DocUl>
      <Warning>Email addresses are case-sensitive during matching. Use lowercase consistently in your CSV and tell registrants to use the same case.</Warning>

      <DocH2 id="direct-invite">Direct invite</DocH2>
      <DocP>From <strong>Dashboard → Teachers</strong> or <strong>Dashboard → Students</strong>, click the <strong>Invite</strong> button and enter an email address. This creates a single invite record. The person still registers using the join code.</DocP>

      <DocH2 id="join-modes">Join modes</DocH2>
      <DocP>Control who can join your institution from <strong>Settings → Who can join</strong>:</DocP>
      <DocUl>
        <DocLi><strong>Join code</strong> (default) — anyone who has the 6-character code can register.</DocLi>
        <DocLi><strong>Open</strong> — anyone can register via your school portal with no code. Use only for public institutions.</DocLi>
        <DocLi><strong>Invite only</strong> — registration is blocked unless an invite record exists for the email. Use for tight access control.</DocLi>
        <DocLi><strong>Domain</strong> — only emails matching your allowed domains (e.g. <code className="bg-white/8 px-1 rounded text-xs">school.edu.ng</code>) can register. Great for universities.</DocLi>
      </DocUl>
      <Note>You can combine domain mode with a join code — the user must both have the code AND a matching email domain.</Note>

      <DocH2 id="suspending">Suspending &amp; removing</DocH2>
      <DocP>From the Teachers or Students list, use the action menu on any person to:</DocP>
      <DocUl>
        <DocLi><strong>Suspend</strong> — blocks login. The user&apos;s data is preserved. They see a "suspended" page if they try to log in. Reversible.</DocLi>
        <DocLi><strong>Unsuspend</strong> — restores access immediately.</DocLi>
        <DocLi><strong>Remove</strong> — deletes the membership. The user&apos;s profile and results are preserved but they can no longer access this institution. They can re-join with the code if you allow it.</DocLi>
      </DocUl>
    </DocPage>
  );
}
