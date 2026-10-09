import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Tip, Note } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/analytics" headings={[
      { id: "overview", label: "Overview stats", depth: 2 },
      { id: "by-subject", label: "Pass rate by subject", depth: 2 },
      { id: "by-assessment", label: "By assessment", depth: 2 },
    ]}>
      <DocH1>Teacher analytics</DocH1>
      <DocLead>See how your students are doing across your assessments and subjects — without leaving your dashboard.</DocLead>

      <DocH2 id="overview">Overview stats</DocH2>
      <DocP>Dashboard → <strong>Analytics</strong>. The three stat cards show:</DocP>
      <DocUl>
        <DocLi><strong>Assessments</strong> — total assessments you&apos;ve created.</DocLi>
        <DocLi><strong>Submissions</strong> — total completed attempts across all your assessments.</DocLi>
        <DocLi><strong>Pass rate</strong> — percentage of your submissions that passed.</DocLi>
      </DocUl>

      <DocH2 id="by-subject">Pass rate by subject</DocH2>
      <DocP>A bar chart showing pass rate per subject. Only subjects where students have completed at least one attempt appear. Bars are coloured with your institution&apos;s primary colour.</DocP>
      <Tip>A subject with a very low pass rate might mean the questions are too hard, the material coverage is insufficient, or students are running out of time. Drill into the by-assessment table to narrow it down.</Tip>

      <DocH2 id="by-assessment">By assessment</DocH2>
      <DocP>A table with one row per assessment showing:</DocP>
      <DocUl>
        <DocLi><strong>N</strong> — number of completed submissions.</DocLi>
        <DocLi><strong>Avg</strong> — mean score percentage.</DocLi>
        <DocLi><strong>Pass</strong> — pass rate percentage.</DocLi>
      </DocUl>
      <DocP>Click any row to go directly to the Submissions list filtered for that assessment.</DocP>
      <Note>In-progress attempts (students who started but haven&apos;t submitted) are excluded from all analytics calculations.</Note>
    </DocPage>
  );
}
