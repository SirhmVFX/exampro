import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Code } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/certificates" headings={[
      { id: "issuing", label: "Issuing a certificate", depth: 2 },
      { id: "verify-link", label: "The verify link", depth: 2 },
      { id: "sharing", label: "Sharing & copying", depth: 2 },
      { id: "issued-list", label: "Issued list", depth: 2 },
    ]}>
      <DocH1>Certificates</DocH1>
      <DocLead>Issue verifiable completion certificates to students. Each one gets a unique public URL anyone can check — no login required.</DocLead>

      <DocH2 id="issuing">Issuing a certificate</DocH2>
      <Steps>
        <Step n={1} title="Go to Certificates">Dashboard → Certificates.</Step>
        <Step n={2} title="Select a student">Choose from the dropdown. It lists all active students.</Step>
        <Step n={3} title="Set the title">Default is "Certificate of completion". Change it to anything: "Certificate of Excellence", "Frontend Development Certificate", etc.</Step>
        <Step n={4} title="Add skills (optional)">Enter comma-separated skill tags: <em>JavaScript, React, Node.js</em>. These appear on the certificate and on the student&apos;s dashboard.</Step>
        <Step n={5} title="Click Issue certificate">The certificate is created instantly and appears in the Issued list below.</Step>
      </Steps>
      <Tip>You can issue multiple certificates to the same student — one per course or achievement.</Tip>

      <DocH2 id="verify-link">The verify link</DocH2>
      <DocP>Every certificate gets a unique <Code>verifyCode</Code> — a short random string. The public verify URL looks like:</DocP>
      <div className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-emerald-300 my-4">
        https://exampro.io/verify/ABC123XY
      </div>
      <DocP>Anyone visiting that URL sees the certificate details: student name, institution, title, skills, and issue date. No login is required.</DocP>
      <Note>The verify page is public and indexed. Do not issue certificates for things you wouldn&apos;t want to be publicly visible.</Note>

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
        <DocLi>Copy button for the full URL</DocLi>
      </DocUl>
      <DocP>Certificates cannot be edited after issue. If you made a mistake, issue a new one with the correct details — there is no delete.</DocP>
    </DocPage>
  );
}
