import { DocPage, DocH1, DocH2, DocLead, DocP, DocTable, Note } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/reference/assessment-kinds" headings={[
      { id: "kinds", label: "All kinds", depth: 2 },
      { id: "modes", label: "Assessment modes", depth: 2 },
    ]}>
      <DocH1>Assessment kinds</DocH1>
      <DocLead>The kind is a label that tells students what type of work this is. All kinds support all question types and settings — it's cosmetic, not functional.</DocLead>

      <DocH2 id="kinds">All kinds</DocH2>
      <DocTable
        headers={["Kind", "Badge colour", "Typical use", "Common settings"]}
        rows={[
          ["Quiz", "Blue", "Short, low-stakes check-in", "5-15 questions, no timer, instant results"],
          ["Test", "Indigo", "Mid-unit formal assessment", "20-40 questions, 60-90 min timer"],
          ["Exam", "Red", "High-stakes, end of term/course", "Full question set, timer, integrity on"],
          ["Assignment", "Amber", "Take-home, open-ended work", "Essay/project questions, no timer, long deadline"],
          ["Project", "Green", "Multi-day capstone work", "Project questions, file upload, rubric"],
          ["Practice", "Gray", "Unlimited revision, no grade", "Instant results, retakes unlimited"],
        ]}
      />
      <Note>The kind appears as a badge on the student&apos;s dashboard and in analytics/gradebook exports. It does not change how ExamPro processes the assessment.</Note>

      <DocH2 id="modes">Assessment modes</DocH2>
      <DocTable
        headers={["Mode", "Description"]}
        rows={[
          ["Live", "Scheduled window — start and end dates. Students take it during the window only."],
          ["Self-paced", "No window. Available continuously until closed. Student decides when to start."],
          ["Practice", "Unlocked retakes, results always shown immediately, doesn't count in gradebook."],
        ]}
      />
    </DocPage>
  );
}
