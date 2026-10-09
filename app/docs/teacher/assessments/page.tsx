import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Warning, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/assessments" headings={[
      { id: "creating", label: "Creating an assessment", depth: 2 },
      { id: "kinds", label: "Assessment kinds", depth: 2 },
      { id: "questions", label: "Adding questions", depth: 2 },
      { id: "settings", label: "Settings", depth: 2 },
      { id: "scheduling", label: "Scheduling", depth: 2 },
      { id: "publishing", label: "Publishing & closing", depth: 2 },
      { id: "retakes", label: "Retakes", depth: 2 },
    ]}>
      <DocH1>Assessments</DocH1>
      <DocLead>An assessment is a collection of questions published to a class. Students see it in their dashboard and take it in the browser.</DocLead>

      <DocH2 id="creating">Creating an assessment</DocH2>
      <Steps>
        <Step n={1} title="Go to Assessments → New">Dashboard → Assessments → <strong>New assessment</strong>.</Step>
        <Step n={2} title="Set the basics">Title, kind (see below), subject, and target class(es). You can target multiple classes.</Step>
        <Step n={3} title="Add questions">Select from your library or create new ones inline. The total points update automatically.</Step>
        <Step n={4} title="Configure settings">Duration, pass %, retake rules, results display, and integrity options.</Step>
        <Step n={5} title="Set a schedule (optional)">Start date/time and end date/time. Leave blank for always-available.</Step>
        <Step n={6} title="Publish">Change status to <strong>Published</strong>. Students see it immediately (or at the start time).</Step>
      </Steps>

      <DocH2 id="kinds">Assessment kinds</DocH2>
      <DocTable
        headers={["Kind", "Typical use", "Notes"]}
        rows={[
          ["Quiz", "Short, low-stakes check", "5–15 questions, usually no timer"],
          ["Test", "Mid-unit evaluation", "20–40 questions, timer common"],
          ["Exam", "High-stakes, end of term", "Full question set, timer, integrity settings"],
          ["Assignment", "Take-home, open-ended", "Usually essay or project questions, no timer"],
          ["Project", "Multi-day submission", "File or GitHub URL submission"],
          ["Practice", "Unlimited retakes, no grade", "Results shown immediately, doesn't affect gradebook"],
        ]}
      />
      <Note>The kind is cosmetic — it appears as a badge on the student&apos;s dashboard and in the gradebook. All kinds support all question types and settings.</Note>

      <DocH2 id="questions">Adding questions</DocH2>
      <DocP>In the question picker, search by subject, class, topic, or type. Select questions with the checkbox. They appear in the question list below in the order you add them.</DocP>
      <DocUl>
        <DocLi><strong>Shuffle questions</strong> — enable to randomise order per student. Reduces seat-neighbour copying.</DocLi>
        <DocLi><strong>Reorder</strong> — drag questions up/down when shuffle is off.</DocLi>
        <DocLi><strong>Remove</strong> — click × on a question to remove it from this assessment (it stays in your library).</DocLi>
      </DocUl>

      <DocH2 id="settings">Settings</DocH2>
      <DocTable
        headers={["Setting", "Description"]}
        rows={[
          ["Duration (mins)", "Timer countdown. 0 = no time limit."],
          ["Pass %", "Minimum percentage to pass. Shown as Pass/Fail badge."],
          ["Allow retake", "Whether students can attempt more than once."],
          ["Max attempts", "Hard cap on retakes. Only applies when retakes are on."],
          ["Show results immediately", "If on, students see score and breakdown right after submit."],
          ["Required material", "Block the assessment until the student marks a specific material complete."],
          ["Required assessment", "Block until student has passed a specific other assessment."],
        ]}
      />

      <DocH2 id="scheduling">Scheduling</DocH2>
      <DocP>Set <strong>Start at</strong> and/or <strong>End at</strong> dates. Before the start time the assessment shows as "Upcoming" and cannot be taken. After the end time it shows as "Closed" and new attempts are blocked (in-progress attempts can still submit).</DocP>
      <Tip>Leave both blank for an always-available assessment. Use just an end date for a deadline without a forced start.</Tip>

      <DocH2 id="publishing">Publishing &amp; closing</DocH2>
      <DocUl>
        <DocLi><strong>Draft</strong> — invisible to students. Safe to work on.</DocLi>
        <DocLi><strong>Published</strong> — visible and takeable by students in the target class(es).</DocLi>
        <DocLi><strong>Closed</strong> — visible but no new attempts. Existing in-progress attempts can still submit.</DocLi>
      </DocUl>
      <Warning>Editing questions or settings after publishing can affect fairness for students who have already started. Make all changes before publishing, or close the assessment first.</Warning>

      <DocH2 id="retakes">Retakes</DocH2>
      <DocP>If <strong>Allow retake</strong> is on, students can take the assessment again after submitting. The gradebook uses the <em>best</em> attempt score across all retakes. Set <strong>Max attempts</strong> to limit how many times they can try.</DocP>
      <Note>Practice assessments ignore max attempts — students can always retake them.</Note>
    </DocPage>
  );
}
