import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/parent/dashboard" headings={[
      { id: "what-you-see", label: "What you can see", depth: 2 },
      { id: "what-you-cannot", label: "What you cannot do", depth: 2 },
    ]}>
      <DocH1>Parent dashboard</DocH1>
      <DocLead>A read-only view of your linked child's schedule and results. Nothing here affects their account.</DocLead>

      <DocH2 id="what-you-see">What you can see</DocH2>
      <DocUl>
        <DocLi><strong>Upcoming assessments</strong> — all published assessments for your child's class, sorted by start date. Shows the title, subject, kind, and scheduled time.</DocLi>
        <DocLi><strong>Recent results</strong> — completed and graded attempts, sorted newest first. Shows assessment title, score, percentage, and pass/fail.</DocLi>
        <DocLi><strong>Child selector</strong> — a dropdown at the top if you have more than one linked child.</DocLi>
      </DocUl>
      <Note>Results with status <em>submitted</em> (pending manual grading) show the auto-graded portion of the score with a "Pending" label. The full score appears once the teacher finishes grading.</Note>

      <DocH2 id="what-you-cannot">What you cannot do</DocH2>
      <DocUl>
        <DocLi>Take exams on behalf of your child</DocLi>
        <DocLi>Edit your child&apos;s profile, name, email, or class</DocLi>
        <DocLi>See the question content (only the assessment title and result)</DocLi>
        <DocLi>See other students&apos; results</DocLi>
        <DocLi>Contact teachers through the platform</DocLi>
        <DocLi>Change anything — the dashboard is entirely read-only</DocLi>
      </DocUl>
      <DocP>For anything beyond viewing results, contact your child&apos;s school admin directly.</DocP>
    </DocPage>
  );
}
