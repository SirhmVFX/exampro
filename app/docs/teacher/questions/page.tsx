import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, Warning, DocTable, CardGrid, Card } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/questions" headings={[
      { id: "library", label: "The question library", depth: 2 },
      { id: "creating", label: "Creating a question", depth: 2 },
      { id: "mcq", label: "MCQ", depth: 3 },
      { id: "truefalse", label: "True / False", depth: 3 },
      { id: "short", label: "Short answer", depth: 3 },
      { id: "essay", label: "Essay", depth: 3 },
      { id: "coding", label: "Coding", depth: 3 },
      { id: "project", label: "Project", depth: 3 },
      { id: "tags", label: "Subject, topic & skill tags", depth: 2 },
      { id: "editing", label: "Editing & deleting", depth: 2 },
      { id: "csv", label: "CSV import", depth: 2 },
    ]}>
      <DocH1>Question library</DocH1>
      <DocLead>Every question you create lives in your library. Reuse them across any number of assessments — edit once, updated everywhere.</DocLead>

      <DocH2 id="library">The question library</DocH2>
      <DocP>Go to <strong>Dashboard → Questions</strong>. Your library shows all questions you&apos;ve created, filterable by type and subject. Questions are <em>yours</em> — other teachers in the institution cannot see or edit them unless you mark them as shared.</DocP>

      <DocH2 id="creating">Creating a question</DocH2>
      <DocP>Click <strong>New question</strong>. Choose the type and fill in the fields. All types share these base fields:</DocP>
      <DocUl>
        <DocLi><strong>Subject</strong> — which course this question belongs to.</DocLi>
        <DocLi><strong>Class</strong> — which student group it targets.</DocLi>
        <DocLi><strong>Topic</strong> (optional) — a sub-heading within the subject.</DocLi>
        <DocLi><strong>Skill</strong> (optional) — maps to institution-defined skill tags for progress tracking.</DocLi>
        <DocLi><strong>Points</strong> — how many points this question is worth.</DocLi>
        <DocLi><strong>Explanation</strong> (optional) — shown to students after grading if results are revealed immediately.</DocLi>
      </DocUl>

      <DocH3 id="mcq">MCQ — Multiple choice</DocH3>
      <DocP>Write the question text, then four options. Mark one as the correct answer by clicking its radio button. Points are awarded in full for the correct choice, zero for any other.</DocP>

      <DocH3 id="truefalse">True / False</DocH3>
      <DocP>Write a statement and set whether it is <strong>True</strong> or <strong>False</strong>. Students see two buttons. Full points for correct, zero for incorrect.</DocP>

      <DocH3 id="short">Short answer</DocH3>
      <DocP>Write the question and add one or more <strong>accepted answers</strong> — exact strings the student&apos;s response must match (case-insensitive). Add variants for common correct phrasings:</DocP>
      <div className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-emerald-300 my-4">
        201 Created · 201 · HTTP 201
      </div>
      <DocP>If the student&apos;s trimmed, lowercased response matches any accepted answer, full points are awarded automatically.</DocP>
      <Tip>For questions where wording varies widely, use Essay instead — short answer is best for factual, single-word or short-phrase responses.</Tip>

      <DocH3 id="essay">Essay</DocH3>
      <DocP>Write the question prompt. Students see a rich-text editor. <strong>Essay questions are not auto-graded</strong> — they flag the attempt as needing manual grading. You score them in Submissions.</DocP>
      <DocP>Add an explanation field to write your model answer or marking scheme — visible to you during grading, not to the student.</DocP>

      <DocH3 id="coding">Coding</DocH3>
      <DocP>Students write code in the browser. Auto-grading runs for <strong>JavaScript only</strong>. For all other languages, the attempt is flagged for manual grading.</DocP>
      <DocUl>
        <DocLi><strong>Language</strong> — JavaScript, Python, HTML, CSS, SQL, or other.</DocLi>
        <DocLi><strong>Starter code</strong> — the template shown to the student when they open the question. Include a function signature so they know the expected interface.</DocLi>
        <DocLi><strong>Test cases</strong> — for JavaScript. Each test has an <strong>input</strong> (JSON-encoded arguments) and an <strong>expectedOutput</strong> string. Add 3–5 cases covering edge cases.</DocLi>
      </DocUl>
      <div className="bg-zinc-950 text-emerald-300 rounded-xl p-4 font-mono text-xs my-4 overflow-x-auto">
        <p className="text-white/30 mb-2">// Example starter code</p>
        <p>{"function solve(n) {"}</p>
        <p>{"  // return the factorial of n"}</p>
        <p>{"}"}</p>
      </div>
      <Warning>Students must define a function named <code className="bg-white/10 text-white/85 px-1 rounded">solve</code>. The sandbox calls <code className="bg-white/10 text-white/85 px-1 rounded">solve(...args)</code> with the test case input. If no <code className="bg-white/10 text-white/85 px-1 rounded">solve</code> function exists, all test cases fail.</Warning>

      <DocH3 id="project">Project</DocH3>
      <DocP>Students upload a file (PDF, ZIP, image) or paste a GitHub URL, plus optional notes. All project questions require manual grading. Use rubrics for consistent scoring — see <strong>Rubrics</strong>.</DocP>

      <DocH2 id="tags">Subject, topic &amp; skill tags</DocH2>
      <DocP>Tagging questions well pays off later:</DocP>
      <DocUl>
        <DocLi><strong>Subject</strong> — required. The gradebook and analytics group by subject.</DocLi>
        <DocLi><strong>Topic</strong> — optional sub-category. Useful for filtering your library when it grows large.</DocLi>
        <DocLi><strong>Skill</strong> — maps to your institution&apos;s defined skills. Student progress shows per-skill breakdowns when questions are tagged.</DocLi>
      </DocUl>

      <DocH2 id="editing">Editing &amp; deleting</DocH2>
      <DocP>Click any question in the library to edit it. Changes apply to new assessments — existing attempts are not retroactively re-graded.</DocP>
      <Warning>Deleting a question from the library does not remove it from assessments that already include it. It only prevents adding it to new assessments.</Warning>

      <DocH2 id="csv">CSV import</DocH2>
      <DocP>Go to <strong>Questions → Import CSV</strong>. Download the template, fill it in, and upload. Supported columns:</DocP>
      <DocTable
        headers={["Column", "Required", "Notes"]}
        rows={[
          ["type", "✓", "mcq | truefalse | short | essay | coding | project"],
          ["text", "✓", "Question text (plain text)"],
          ["subject", "✓", "Must match an existing subject"],
          ["className", "✓", "Must match an existing class name"],
          ["points", "✓", "Integer"],
          ["options", "MCQ only", "4 options separated by | e.g. Option A|Option B|Option C|Option D"],
          ["correctIndex", "MCQ only", "0-based index of correct option (0, 1, 2, or 3)"],
          ["correctBool", "TF only", "true or false"],
          ["acceptedAnswers", "Short only", "Pipe-separated accepted answers"],
          ["explanation", "—", "Optional model answer / hint"],
        ]}
      />
    </DocPage>
  );
}
