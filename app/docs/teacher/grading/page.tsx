import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/grading" headings={[
      { id: "auto-graded", label: "Auto-graded questions", depth: 2 },
      { id: "manual", label: "Manual grading", depth: 2 },
      { id: "workflow", label: "Grading workflow", depth: 2 },
      { id: "override", label: "Overriding auto grades", depth: 2 },
      { id: "feedback", label: "Per-question feedback", depth: 2 },
      { id: "status", label: "Submission statuses", depth: 2 },
    ]}>
      <DocH1>Grading</DocH1>
      <DocLead>MCQ, true/false, and JavaScript coding questions grade themselves. Essay and project questions — and coding in any other language — wait for you.</DocLead>

      <DocH2 id="auto-graded">Auto-graded questions</DocH2>
      <DocP>These question types grade the moment a student submits:</DocP>
      <DocUl>
        <DocLi><strong>MCQ</strong> — full points if the selected option matches <code className="bg-white/8 px-1 rounded text-xs">correctIndex</code>, zero otherwise.</DocLi>
        <DocLi><strong>True / False</strong> — full points if the answer matches <code className="bg-white/8 px-1 rounded text-xs">correctBool</code>.</DocLi>
        <DocLi><strong>Short answer</strong> — full points if the trimmed, lowercased response matches any <code className="bg-white/8 px-1 rounded text-xs">acceptedAnswers</code> entry.</DocLi>
        <DocLi><strong>Coding (JavaScript)</strong> — partial credit based on how many test cases pass: <code className="bg-white/8 px-1 rounded text-xs">passed / total × points</code>.</DocLi>
      </DocUl>

      <DocH2 id="manual">Manual grading</DocH2>
      <DocP>These always require you to grade:</DocP>
      <DocUl>
        <DocLi><strong>Essay</strong> — open-ended text. You read the response and award points.</DocLi>
        <DocLi><strong>Project</strong> — file upload or GitHub URL. You review and score.</DocLi>
        <DocLi><strong>Coding (non-JavaScript)</strong> — Python, HTML, CSS, SQL, etc. are flagged for manual review.</DocLi>
      </DocUl>
      <Note>An attempt with any manually-graded question gets status <strong>submitted</strong> (not <strong>graded</strong>) until you complete grading. The student sees their auto-graded score immediately but the full result is pending.</Note>

      <DocH2 id="workflow">Grading workflow</DocH2>
      <Steps>
        <Step n={1} title="Go to Submissions">Dashboard → <strong>Submissions</strong>. Filter by <em>Needs grading</em> to find pending attempts.</Step>
        <Step n={2} title="Open the submission">Click a student&apos;s name. You see every question with their answer alongside the question text.</Step>
        <Step n={3} title="Review each question">For manual questions, read the answer. For auto-graded ones, review if you want to override.</Step>
        <Step n={4} title="Set points and feedback">Enter points awarded (0 to max) and optional feedback text for each question.</Step>
        <Step n={5} title="Save grades">Click <strong>Save grades</strong>. The attempt status changes to <em>graded</em>. The student&apos;s results update immediately if results are visible to them.</Step>
      </Steps>

      <DocH2 id="override">Overriding auto grades</DocH2>
      <DocP>Every question — even auto-graded ones — shows a points input field in the grading view. Change the value and save to override the auto-grade. Use this for:</DocP>
      <DocUl>
        <DocLi>Accepting an alternative correct phrasing for a short-answer question</DocLi>
        <DocLi>Awarding partial credit for a nearly-correct MCQ</DocLi>
        <DocLi>Correcting a test-case edge case in a coding question</DocLi>
      </DocUl>

      <DocH2 id="feedback">Per-question feedback</DocH2>
      <DocP>Enter feedback text in the feedback field of any question. The student sees this feedback on their result detail page after grading is complete. Keep it specific — "Good reasoning but the conclusion was off" is more useful than "Partially correct".</DocP>
      <Tip>Feedback is optional but improves learning outcomes significantly. Even a single sentence per essay question helps students understand where they went wrong.</Tip>

      <DocH2 id="status">Submission statuses</DocH2>
      <DocUl>
        <DocLi><strong>in_progress</strong> — student has started but not submitted. You can view but not grade.</DocLi>
        <DocLi><strong>submitted</strong> — student has submitted; contains manual questions awaiting your review.</DocLi>
        <DocLi><strong>graded</strong> — fully graded (either all auto, or you&apos;ve reviewed all manual questions).</DocLi>
      </DocUl>
    </DocPage>
  );
}
