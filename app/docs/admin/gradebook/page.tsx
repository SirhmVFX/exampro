import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/gradebook" headings={[
      { id: "what", label: "What the gradebook shows", depth: 2 },
      { id: "filtering", label: "Filtering by term", depth: 2 },
      { id: "best-attempt", label: "Best-attempt logic", depth: 2 },
      { id: "export", label: "Exporting", depth: 2 },
    ]}>
      <DocH1>Gradebook</DocH1>
      <DocLead>A per-student, per-subject summary showing the best attempt score for each combination — filterable by term.</DocLead>

      <DocH2 id="what">What the gradebook shows</DocH2>
      <DocP>Go to <strong>Dashboard → Gradebook</strong>. The table has one row per student and one column per subject. Each cell shows the student&apos;s best score (%) across all their attempts in that subject for the selected term.</DocP>
      <DocTable
        headers={["Column", "Description"]}
        rows={[
          ["Student", "Full name of the student"],
          ["Class", "The student's assigned class"],
          ["[Subject name]", "Best attempt percentage for that subject in the selected term"],
          ["Overall", "Average across all subjects with at least one attempt"],
        ]}
      />
      <Note>Only <strong>submitted</strong> and <strong>graded</strong> attempts count. In-progress attempts are excluded.</Note>

      <DocH2 id="filtering">Filtering by term</DocH2>
      <DocP>Use the term dropdown at the top of the gradebook to filter results to a specific term. Only attempts whose assessment was created during that term appear. If no term is selected, all attempts are included.</DocP>
      <Tip>Create terms before the academic year starts so every assessment is automatically tagged to the right period. See <strong>Structure → Terms</strong>.</Tip>

      <DocH2 id="best-attempt">Best-attempt logic</DocH2>
      <DocP>When a student takes the same assessment multiple times (retakes), only their highest score counts in the gradebook. This applies per assessment, then the gradebook picks the best score per subject across all assessments in that subject.</DocP>

      <DocH2 id="export">Exporting</DocH2>
      <DocP>Go to <strong>Dashboard → Export</strong>. Three CSV exports are available:</DocP>
      <DocUl>
        <DocLi><strong>Results export</strong> — every attempt with student name, assessment title, score, percent, pass/fail, and date.</DocLi>
        <DocLi><strong>Roster export</strong> — all students and teachers with name, email, role, and class.</DocLi>
        <DocLi><strong>Question bank export</strong> — all questions with type, subject, text, and correct answer.</DocLi>
      </DocUl>
      <DocP>Files download immediately as <code className="bg-white/8 px-1 rounded text-xs">.csv</code> — open in Excel, Google Sheets, or any spreadsheet tool.</DocP>
    </DocPage>
  );
}
