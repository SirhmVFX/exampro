import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/billing/limits" headings={[
      { id: "student-teacher", label: "Student & teacher limits", depth: 2 },
      { id: "ai", label: "AI generation quota", depth: 2 },
      { id: "downgrade", label: "Downgrading", depth: 2 },
    ]}>
      <DocH1>Limits &amp; upgrades</DocH1>
      <DocLead>What happens when you hit your plan's limits — and how to increase them.</DocLead>

      <DocH2 id="student-teacher">Student &amp; teacher limits</DocH2>
      <DocP>Each plan has a cap on active students and active teachers. When you reach the cap:</DocP>
      <DocUl>
        <DocLi>New sign-ups with your join code are blocked — the registration page shows a "Capacity reached" message.</DocLi>
        <DocLi>Existing users keep full access — they are not suspended.</DocLi>
        <DocLi>Admins can still suspend existing users to free up seats.</DocLi>
      </DocUl>
      <DocP>To allow more people in, go to <strong>Dashboard → Billing</strong> and upgrade to a higher plan.</DocP>
      <Note>Suspended users do not count toward your limit. Suspending inactive students is a good way to free up seats on the Free plan without upgrading.</Note>

      <DocH2 id="ai">AI generation quota</DocH2>
      <DocP>The AI generation quota is shared across all teachers in the institution and resets on the 1st of each calendar month.</DocP>
      <DocUl>
        <DocLi>Each generation request consumes 1 unit, regardless of how many questions you generate (1 to 20).</DocLi>
        <DocLi>When the quota is exhausted, the Generate button shows an error until next month.</DocLi>
        <DocLi>The admin sees current usage in <strong>Billing → Current plan</strong>.</DocLi>
      </DocUl>
      <Warning>Unused quota does not carry over to the next month — use it or lose it.</Warning>

      <DocH2 id="downgrade">Downgrading</DocH2>
      <DocP>To downgrade, go to <strong>Dashboard → Billing</strong> and click <strong>Switch to Free</strong>. This takes effect immediately. Your data is preserved but:</DocP>
      <DocUl>
        <DocLi>If you have more than 30 active students, new sign-ups are blocked until the count drops below 30.</DocLi>
        <DocLi>Existing users above the limit are not automatically suspended — you manage that manually.</DocLi>
        <DocLi>AI quota drops to 20/month from the next month.</DocLi>
      </DocUl>
    </DocPage>
  );
}
