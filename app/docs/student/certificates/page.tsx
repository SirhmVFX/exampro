import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/certificates" headings={[
      { id: "viewing", label: "Viewing your certificates", depth: 2 },
      { id: "sharing", label: "Sharing", depth: 2 },
      { id: "verifying", label: "Verify page", depth: 2 },
    ]}>
      <DocH1>Certificates</DocH1>
      <DocLead>Verifiable completion certificates issued by your institution. Share them with employers, on LinkedIn, or on your CV.</DocLead>

      <DocH2 id="viewing">Viewing your certificates</DocH2>
      <DocP>Go to <strong>Dashboard → Certificates</strong>. Each certificate card shows:</DocP>
      <DocUl>
        <DocLi>Certificate title (e.g. "Certificate of completion")</DocLi>
        <DocLi>Issuing institution name</DocLi>
        <DocLi>Issue date</DocLi>
        <DocLi>Skills listed on the certificate (if any)</DocLi>
        <DocLi>The unique verify code</DocLi>
        <DocLi>A <strong>Copy link</strong> button</DocLi>
      </DocUl>

      <DocH2 id="sharing">Sharing</DocH2>
      <DocP>Click <strong>Copy link</strong> to copy the full verify URL to your clipboard. Paste it anywhere:</DocP>
      <DocUl>
        <DocLi>LinkedIn profile → Add credential → Credential URL</DocLi>
        <DocLi>CV / résumé — paste as a footnote or hyperlink</DocLi>
        <DocLi>Email to a recruiter or admission office</DocLi>
      </DocUl>
      <Tip>The verify link never expires. Anyone who has it can confirm the certificate is genuine — no login required.</Tip>

      <DocH2 id="verifying">Verify page</DocH2>
      <DocP>The verify URL looks like <code className="bg-white/8 px-1 rounded text-xs">exampro.io/verify/ABC123XY</code>. Anyone visiting it sees:</DocP>
      <DocUl>
        <DocLi>Your full name</DocLi>
        <DocLi>Issuing institution name</DocLi>
        <DocLi>Certificate title</DocLi>
        <DocLi>Skills listed</DocLi>
        <DocLi>Issue date</DocLi>
        <DocLi>A "This certificate is valid" confirmation badge</DocLi>
      </DocUl>
    </DocPage>
  );
}
