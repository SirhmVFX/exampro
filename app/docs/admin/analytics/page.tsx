import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/analytics" headings={[
      { id: "overview-stats", label: "Overview stats", depth: 2 },
      { id: "pass-rate-charts", label: "Pass rate charts", depth: 2 },
      { id: "teacher-table", label: "Teacher performance table", depth: 2 },
      { id: "when-data-appears", label: "When data appears", depth: 2 },
    ]}>
      <DocH1>Analytics</DocH1>
      <DocLead>Institution-wide pass rates, subject breakdowns, and teacher performance — computed from all submitted and graded attempts.</DocLead>

      <DocH2 id="overview-stats">Overview stats</DocH2>
      <DocP>Go to <strong>Dashboard → Analytics</strong>. The four stat cards at the top show:</DocP>
      <DocUl>
        <DocLi><strong>Students</strong> — total active students.</DocLi>
        <DocLi><strong>Teachers</strong> — total active teachers.</DocLi>
        <DocLi><strong>Assessments</strong> — total published and closed assessments.</DocLi>
        <DocLi><strong>Institution pass rate</strong> — percentage of completed attempts that passed, with average score as a sub-label.</DocLi>
      </DocUl>

      <DocH2 id="pass-rate-charts">Pass rate charts</DocH2>
      <DocP>Two bar charts appear once students start submitting:</DocP>
      <DocUl>
        <DocLi><strong>Pass rate by class</strong> — each bar represents one class, sorted highest first. Hover for the exact percentage.</DocLi>
        <DocLi><strong>Pass rate by subject</strong> — same layout, grouped by subject instead of class.</DocLi>
      </DocUl>
      <Tip>A subject with a very low pass rate often means the assessments are too hard, or students haven&apos;t been assigned materials for it. Cross-reference with the teacher performance table.</Tip>

      <DocH2 id="teacher-table">Teacher performance table</DocH2>
      <DocP>Below the charts, a table shows every teacher who has at least one student submission:</DocP>
      <DocUl>
        <DocLi><strong>Submissions</strong> — total attempts across all their assessments.</DocLi>
        <DocLi><strong>Avg score</strong> — mean score percentage across all their submissions.</DocLi>
        <DocLi><strong>Pass rate</strong> — percentage of their submissions that passed.</DocLi>
      </DocUl>
      <Note>This table reflects the results of students taking assessments those teachers created — it&apos;s a proxy for instructional effectiveness, not a judgement on the teacher.</Note>

      <DocH2 id="when-data-appears">When data appears</DocH2>
      <DocP>Analytics are computed live from Firestore on every page load — there&apos;s no caching delay. Data appears as soon as students start submitting. The page shows an empty state with a message until the first submission exists.</DocP>
    </DocPage>
  );
}
