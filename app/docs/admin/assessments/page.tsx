import {
  DocPage,
  DocH1,
  DocH2,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Steps,
  Step,
  Note,
  Tip,
  Warning,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/admin/assessments"
      headings={[
        {
          id: "overview",
          label: "Tests, Quizzes, Exams & Assignments",
          depth: 2,
        },
        { id: "tabs", label: "Filter by type (sidebar)", depth: 2 },
        { id: "kinds", label: "Assessment kinds", depth: 2 },
        { id: "creating", label: "Creating an assessment", depth: 2 },
        { id: "generating", label: "Generating with AI", depth: 2 },
        { id: "assigning", label: "Assigning & trials", depth: 2 },
        { id: "results", label: "Immediate results & corrections", depth: 2 },
        { id: "editing", label: "Editing & grading", depth: 2 },
      ]}
    >
      <DocH1>Assessments — Test, Exam, Quiz & more</DocH1>
      <DocLead>
        Administrators create, generate, and assign the full range of
        assessments — Tests, Quizzes, Exams, and Assignments — exactly as
        teachers do, with institution-wide visibility. Add up to 100 MCQ or
        mixed-type questions, set the number of trials, and publish to students.
      </DocLead>

      <DocH2 id="overview">Tests, Quizzes, Exams &amp; Assignments</DocH2>
      <DocP>
        Go to <strong>Dashboard → Assessments</strong>. You get the complete
        assessment engine: build a paper from the question library, generate one
        with AI, assign it to a class or hand-picked students, and track results
        — just like the Test/Exam/Quiz module in Bridgitus Admin. Every list row
        shows the <strong>creator</strong>, so you can see which instructor
        built each assessment across the whole institution.
      </DocP>

      <DocH2 id="tabs">Filter by type from the sidebar</DocH2>
      <DocP>
        The sidebar lists{" "}
        <strong>
          Quizzes · Tests · Exams · Assignments · Projects · Practice
        </strong>{" "}
        directly under <strong>Assessments</strong> — clicking one opens the
        list filtered to that type, exactly like the teacher view. Admins see
        assessments from <em>every</em> instructor in the institution, so{" "}
        <strong>Assessments</strong> itself doubles as an institution-wide
        content audit; click a type entry to focus on, say, all Exams across all
        teachers.
      </DocP>

      <DocH2 id="kinds">Assessment kinds</DocH2>
      <DocTable
        headers={["Kind", "Typical use", "Notes"]}
        rows={[
          [
            "Quiz",
            "Short, low-stakes check",
            "5–15 questions, usually untimed",
          ],
          ["Test", "Mid-unit evaluation", "20–40 questions, timer common"],
          [
            "Exam",
            "High-stakes, end of term",
            "Up to 100 questions, timer + integrity",
          ],
          ["Assignment", "Take-home, open-ended", "Essay or project questions"],
          [
            "Practice",
            "Unlimited retakes, no grade",
            "Results shown immediately",
          ],
        ]}
      />
      <Note>
        The kind is a label — every kind supports all question types, trials,
        and settings. Pick whichever matches your school&apos;s terminology.
      </Note>

      <DocH2 id="creating">Creating an assessment</DocH2>
      <Steps>
        <Step n={1} title="Start a new assessment">
          Dashboard → Assessments → <strong>New assessment</strong>.
        </Step>
        <Step n={2} title="Set the basics">
          Title, kind (quiz / test / exam / assignment), subject, and target
          class(es) or students.
        </Step>
        <Step n={3} title="Add questions">
          Pick from the library, <strong>Import from sets</strong> to pull a
          whole subject-folder set in one click, or create questions inline — up
          to <strong>100 questions</strong>, MCQ or any mix of types.
        </Step>
        <Step n={4} title="Configure settings">
          Duration, pass %, number of trials (max attempts), immediate results,
          and integrity options.
        </Step>
        <Step n={5} title="Publish">
          Set status to <strong>Published</strong>. Students see it right away.
        </Step>
      </Steps>

      <DocH2 id="generating">Generating with AI</DocH2>
      <DocP>
        From the builder, click <strong>Generate with AI</strong>. Describe the
        subject, topic, difficulty, count, and question types — Gemini drafts up
        to 100 questions with answers and explanations. Review the generated
        questions, keep the good ones, then assign. The same generator lives in
        the Question library for reusable, foldered sets.
      </DocP>

      <DocH2 id="assigning">Assigning &amp; trials</DocH2>
      <DocP>
        Assign to an entire class or tick specific students.{" "}
        <strong>Max attempts</strong> is the number of trials each student gets
        — set it to 1 for a single sitting or higher to allow retakes. You can
        assign the same Test/Exam/Quiz as many times as you need: re-publish a
        closed one, duplicate a set into a new paper, or schedule it again for
        another cohort.
      </DocP>
      <DocUl>
        <DocLi>
          <strong>Allow retake</strong> on + <strong>Max attempts</strong> caps
          how many tries students get; the gradebook keeps the <em>best</em>{" "}
          score.
        </DocLi>
        <DocLi>
          <strong>Practice</strong> kind ignores the cap — unlimited attempts.
        </DocLi>
      </DocUl>

      <DocH2 id="results">Immediate results &amp; corrections</DocH2>
      <DocP>
        Turn on <strong>Show results immediately</strong> and students see their
        score, which questions they missed, the correct answers, and any
        explanations the moment they submit — then take corrections by retaking
        (up to their trial limit). MCQ, true/false and short-answer auto-grade
        instantly; essays, projects and non-JS coding are flagged for manual
        grading.
      </DocP>

      <DocH2 id="editing">Editing &amp; grading</DocH2>
      <DocP>
        Click <strong>Edit</strong> on any assessment to change its questions,
        settings, or assignment. Use <strong>Results &amp; grading</strong> (→
        Dashboard → Submissions) to score manual responses institution-wide.
      </DocP>
      <Warning>
        Editing questions after publishing can affect fairness for students who
        already started. Make changes before publishing, or close the assessment
        first.
      </Warning>
      <Tip>
        Want a whole subject ready to assign? Build it as a question set in the
        library first, then use <strong>Use in assessment</strong> — see the
        Admin <strong>Question library</strong> guide.
      </Tip>
    </DocPage>
  );
}
