import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Warning, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/reference/question-types" headings={[
      { id: "overview", label: "Overview", depth: 2 },
      { id: "mcq", label: "MCQ", depth: 3 },
      { id: "truefalse", label: "True / False", depth: 3 },
      { id: "short", label: "Short answer", depth: 3 },
      { id: "essay", label: "Essay", depth: 3 },
      { id: "coding", label: "Coding", depth: 3 },
      { id: "project", label: "Project", depth: 3 },
      { id: "choosing", label: "Choosing the right type", depth: 2 },
    ]}>
      <DocH1>Question types</DocH1>
      <DocLead>Six types covering recall, application, analysis, and creation. Mix them in one assessment for the best signal.</DocLead>

      <DocH2 id="overview">Overview</DocH2>
      <DocTable
        headers={["Type", "Auto-graded?", "Best for"]}
        rows={[
          ["MCQ", "✓ Full auto", "Knowledge recall, concept checks"],
          ["True / False", "✓ Full auto", "Quick fact checks, misconception testing"],
          ["Short answer", "✓ Full auto (exact match)", "Definitions, single-answer factual questions"],
          ["Essay", "✗ Manual", "Analysis, reasoning, extended writing"],
          ["Coding (JS)", "✓ Partial credit via test cases", "Programming skills, algorithm design"],
          ["Coding (other)", "✗ Manual", "Python, SQL, HTML, CSS, other languages"],
          ["Project", "✗ Manual", "Portfolios, long-form work, file submissions"],
        ]}
      />

      <DocH3 id="mcq">MCQ — Multiple choice</DocH3>
      <DocP>Four options, one correct. Graded immediately — full points for correct, zero for any incorrect option. Enable <strong>shuffle questions</strong> on the assessment to randomise option order per student.</DocP>

      <DocH3 id="truefalse">True / False</DocH3>
      <DocP>A statement the student marks True or False. Good for testing common misconceptions. Keep statements unambiguous — avoid double negatives.</DocP>

      <DocH3 id="short">Short answer</DocH3>
      <DocP>Student types a free-text response. ExamPro trims whitespace and lowercases both the response and your accepted answers before comparing. Add all reasonable phrasings as accepted answers.</DocP>
      <Note>Short answer is exact-match only — there is no fuzzy matching. For nuanced answers, use Essay instead.</Note>

      <DocH3 id="essay">Essay</DocH3>
      <DocP>Student writes in a rich-text editor. You grade manually in Submissions. Attach a rubric for consistent multi-criterion scoring. The explanation field is your private marking scheme — not shown to students.</DocP>

      <DocH3 id="coding">Coding</DocH3>
      <DocP><strong>JavaScript only</strong> is auto-graded. The student writes a function named <code className="bg-white/8 px-1 rounded text-xs font-mono">solve</code>. ExamPro runs it in a sandboxed Web Worker against your test cases with a 4-second timeout.</DocP>
      <DocUl>
        <DocLi><strong>Partial credit</strong> — <code className="bg-white/8 px-1 rounded text-xs">passed / total × points</code></DocLi>
        <DocLi><strong>Timeout</strong> — infinite loops get 0 points and a "TIMEOUT" message</DocLi>
        <DocLi><strong>HTML/CSS preview</strong> — live preview panel shown to student while writing</DocLi>
        <DocLi><strong>Other languages</strong> — flagged for manual review</DocLi>
      </DocUl>
      <Warning>The sandbox runs in the student&apos;s browser — it cannot access your servers or other students&apos; data. <code className="bg-white/8 px-1 rounded text-xs">fetch</code>, DOM, and <code className="bg-white/8 px-1 rounded text-xs">localStorage</code> are blocked inside the worker.</Warning>

      <DocH3 id="project">Project</DocH3>
      <DocP>Student submits a file upload (PDF, ZIP, image — up to 8 MB via Cloudinary), a GitHub URL, and optional notes. You grade manually. Ideal for capstone projects, portfolios, or multi-day assignments.</DocP>

      <DocH2 id="choosing">Choosing the right type</DocH2>
      <DocUl>
        <DocLi>For <strong>quick knowledge checks</strong> → MCQ or True/False</DocLi>
        <DocLi>For <strong>vocabulary and definitions</strong> → Short answer</DocLi>
        <DocLi>For <strong>reasoning, analysis, writing</strong> → Essay with a rubric</DocLi>
        <DocLi>For <strong>JavaScript functions and algorithms</strong> → Coding (JS) with test cases</DocLi>
        <DocLi>For <strong>other languages or full programs</strong> → Coding (other) graded manually</DocLi>
        <DocLi>For <strong>multi-day work, portfolios</strong> → Project</DocLi>
      </DocUl>
    </DocPage>
  );
}
