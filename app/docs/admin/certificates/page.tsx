import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/certificates" headings={[
      { id: "issuing", label: "Issuing a certificate", depth: 2 },
      { id: "bulk-issue", label: "Bulk issue to all who passed", depth: 2 },
      { id: "verify-link", label: "The verify link", depth: 2 },
      { id: "sharing", label: "Sharing & copying", depth: 2 },
      { id: "issued-list", label: "Issued list", depth: 2 },
    ]}>
      <DocH1>Certificates</DocH1>
      <DocLead>Issue verifiable completion certificates to students — one at a time or in bulk for everyone who passed an assessment. Each certificate gets a unique public URL anyone can check without logging in.</DocLead>

      <DocH2 id="issuing">Issuing a certificate</DocH2>
      <Steps>
        <Step n={1} title="Go to Certificates">Dashboard → <strong>Certificates</strong> → <strong>Issue</strong> tab.</Step>
        <Step n={2} title="Select a student">Choose from the dropdown. It lists all active students.</Step>
        <Step n={3} title="Set the title">Default is &quot;Certificate of completion&quot;. Change it to anything: &quot;Certificate of Excellence&quot;, &quot;Frontend Development Certificate&quot;, etc.</Step>
        <Step n={4} title="Add skills (optional)">Enter comma-separated skill tags: <em>JavaScript, React, Node.js</em>. These appear on the certificate and on the student&apos;s dashboard.</Step>
        <Step n={5} title="Click Issue certificate">The certificate is created instantly and appears in the Issued list.</Step>
      </Steps>
      <Tip>You can issue multiple certificates to the same student — one per course or achievement.</Tip>

      <DocH2 id="bulk-issue">Bulk issue to all who passed</DocH2>
      <DocP>
        Instead of issuing one by one, use the <strong>Bulk issue</strong> card to send certificates to every student who passed a specific assessment in one click.
      </DocP>
      <Steps>
        <Step n={1} title="Scroll to Bulk issue">Below the single-issue form, find the <strong>Bulk issue to all who passed</strong> card.</Step>
        <Step n={2} title="Pick an assessment">Select the assessment from the dropdown. All published assessments in your institution appear here.</Step>
        <Step n={3} title="Set the title">Enter the certificate title. All bulk-issued certificates get the same title.</Step>
        <Step n={4} title="Click Issue to all who passed">ExamPro finds every student who has at least one passing attempt and <strong>does not already have a certificate</strong> for this assessment, then issues a certificate to each one.</Step>
      </Steps>
      <Note>Bulk issue is idempotent — running it twice will not create duplicates. Students who already hold a certificate for that assessment are skipped automatically.</Note>
      <Warning>Certificates cannot be edited or deleted after issue. If you made a mistake, issue a corrected one — there is no undo.</Warning>

      <DocH2 id="verify-link">The verify link</DocH2>
      <DocP>Every certificate gets a unique <code className="bg-white/8 px-1 rounded text-xs">verifyCode</code>. The public verify URL looks like:</DocP>
      <div className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-emerald-300 my-4">
        https://exampro.io/verify/ABC123XY
      </div>
      <DocP>Anyone visiting that URL sees the certificate details: student name, institution, title, skills, and issue date. No login is required.</DocP>
      <Note>The verify page is public and indexed. Do not issue certificates for things you would not want to be publicly visible.</Note>

      <DocH2 id="sharing">Sharing &amp; copying</DocH2>
      <DocP>In the Issued list, click the copy icon next to any certificate to copy its full verify URL to the clipboard. Share it with the student — they can paste it in a CV, LinkedIn profile, or email.</DocP>
      <DocP>Students also see their certificates on their own dashboard under <strong>Certificates</strong>, with the same copy button.</DocP>

      <DocH2 id="issued-list">Issued list</DocH2>
      <DocP>The Issued list shows every certificate ever issued by your institution, sorted newest first:</DocP>
      <DocUl>
        <DocLi>Student name</DocLi>
        <DocLi>Certificate title</DocLi>
        <DocLi>Issue date</DocLi>
        <DocLi>Verify code (short form)</DocLi>
        <DocLi>Whether the certificate has been emailed to the student</DocLi>
        <DocLi>Copy button for the full verify URL</DocLi>
      </DocUl>
    </DocPage>
  );
}
