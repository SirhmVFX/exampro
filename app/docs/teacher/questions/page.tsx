import {
  DocPage,
  DocH1,
  DocH2,
  DocH3,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Note,
  Tip,
  Warning,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/teacher/questions"
      headings={[
        { id: "library", label: "The question library", depth: 2 },
        { id: "folders", label: "Subject folders & question sets", depth: 2 },
        { id: "shared-bank", label: "Shared question bank", depth: 2 },
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
      ]}
    >
      <DocH1>Question library</DocH1>
      <DocLead>
        Every question you create lives in your library, organised into subject
        folders and reusable question sets of up to 100 questions. Reuse them
        across any number of assessments — and browse questions shared by other teachers in your institution.
      </DocLead>

      <DocH2 id="library">The question library</DocH2>
      <DocP>
        Go to <strong>Dashboard → Questions</strong>. Your library shows all
        questions you&apos;ve created, filterable by type, subject, and
        difficulty. Toggle between the <strong>Folders</strong> view (grouped by
        subject) and a flat <strong>All questions</strong> view.
      </DocP>

      <DocH2 id="folders">Subject folders &amp; question sets</DocH2>
      <DocP>
        In folder view, every subject in your institution gets its own folder.
        Open a folder to see the questions and question sets filed under that
        subject.
      </DocP>
      <DocP>
        A <strong>question set</strong> is a ready-made group of up to{" "}
        <strong>100 questions</strong> on one topic or skill. Build sets three ways:
      </DocP>
      <DocUl>
        <DocLi><strong>Manually</strong> — click <strong>New question set</strong>, pick the subject folder, and add questions one by one.</DocLi>
        <DocLi><strong>From AI</strong> — generated questions are saved straight into a subject folder as a set.</DocLi>
        <DocLi><strong>From CSV</strong> — imported questions are filed into a set in the subject you choose.</DocLi>
      </DocUl>

      <DocH2 id="shared-bank">Shared question bank</DocH2>
      <DocP>
        Any teacher can mark a question as <strong>Shared</strong> when creating or editing it. Shared questions become visible to all teachers in the institution in the <strong>Shared bank</strong>.
      </DocP>
      <DocP>To browse the shared bank:</DocP>
      <DocUl>
        <DocLi>Go to <strong>Dashboard → Questions</strong>.</DocLi>
        <DocLi>Click the <strong>Shared bank</strong> button in the toolbar.</DocLi>
        <DocLi>Browse questions from all teachers. Each row shows the question type, difficulty, subject, and points.</DocLi>
        <DocLi>Click <strong>Copy to my bank</strong> on any question to create your own editable copy in your personal library. The original in the shared bank is not affected.</DocLi>
      </DocUl>
      <Note>Your own shared questions do not appear in your shared bank view — only other teachers&apos; shared questions show there. To see your own, use the main library view.</Note>
      <Tip>Sharing a question is a great way to build a consistent question pool across a subject department. Agree on a subject naming convention first so questions file into the right folders.</Tip>

      <DocH2 id="creating">Creating a question</DocH2>
      <DocP>
        Click <strong>New question</strong>. Choose the type and fill in the
        fields. All types share these base fields:
      </DocP>
      <DocUl>
        <DocLi><strong>Subject</strong> — which course this question belongs to.</DocLi>
        <DocLi><strong>Class</strong> — which student group it targets.</DocLi>
        <DocLi><strong>Topic</strong> (optional) — a sub-heading within the subject.</DocLi>
        <DocLi><strong>Skill</strong> (optional) — maps to institution-defined skill tags for progress tracking.</DocLi>
        <DocLi><strong>Points</strong> — how many points this question is worth.</DocLi>
        <DocLi>
          <strong>Difficulty</strong> (optional) — Easy, Medium, Hard, Support, Core, or Extension. Used for filtering in the library and in the assessment builder.
        </DocLi>
        <DocLi><strong>Explanation</strong> (optional) — shown to students after grading if results are revealed immediately.</DocLi>
        <DocLi><strong>Shared</strong> — tick this to make the question visible in the institution-wide shared bank.</DocLi>
      </DocUl>

      <DocH3 id="mcq">MCQ — Multiple choice</DocH3>
      <DocP>Write the question text, then four options. Mark one as the correct answer by clicking its radio button. Points are awarded in full for the correct choice, zero for any other.</DocP>

      <DocH3 id="truefalse">True / False</DocH3>
      <DocP>Write a statement and set whether it is <strong>True</strong> or <strong>False</strong>. Full points for correct, zero for incorrect.</DocP>

      <DocH3 id="short">Short answer</DocH3>
      <DocP>Write the question and add one or more <strong>accepted answers</strong> — exact strings the student&apos;s response must match (case-insensitive). Add variants for common correct phrasings.</DocP>
      <Tip>For questions where wording varies widely, use Essay instead — short answer is best for factual, single-word or short-phrase responses.</Tip>

      <DocH3 id="essay">Essay</DocH3>
      <DocP>Write the question prompt. Students see a rich-text editor. <strong>Essay questions are not auto-graded</strong> — they flag the attempt as needing manual grading. You score them in Submissions.</DocP>

      <DocH3 id="coding">Coding</DocH3>
      <DocP>Students write code in the browser. Auto-grading runs for <strong>JavaScript only</strong>. For all other languages, the attempt is flagged for manual grading.</DocP>
      <DocUl>
        <DocLi><strong>Language</strong> — JavaScript, Python, HTML, CSS, SQL, or other.</DocLi>
        <DocLi><strong>Starter code</strong> — the template shown to the student. Include a function signature.</DocLi>
        <DocLi><strong>Test cases</strong> — for JavaScript. Each test has an input (JSON-encoded arguments) and an expectedOutput string. Add 3–5 cases covering edge cases.</DocLi>
      </DocUl>
      <Warning>
        Students must define a function named{" "}
        <code className="bg-white/10 text-white/85 px-1 rounded">solve</code>.
        The sandbox calls{" "}
        <code className="bg-white/10 text-white/85 px-1 rounded">solve(...args)</code>{" "}
        with the test case input.
      </Warning>

      <DocH3 id="project">Project</DocH3>
      <DocP>Students upload a file or paste a GitHub URL, plus optional notes. All project questions require manual grading.</DocP>

      <DocH2 id="tags">Subject, topic &amp; skill tags</DocH2>
      <DocUl>
        <DocLi><strong>Subject</strong> — required. The gradebook and analytics group by subject.</DocLi>
        <DocLi><strong>Topic</strong> — optional sub-category. Useful for filtering your library when it grows large.</DocLi>
        <DocLi><strong>Skill</strong> — maps to your institution&apos;s defined skills. Student progress shows per-skill breakdowns when questions are tagged.</DocLi>
        <DocLi><strong>Difficulty</strong> — filters the library and the assessment builder question panel. Use it to build tiered assessments easily.</DocLi>
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
