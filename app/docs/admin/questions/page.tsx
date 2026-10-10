import {
  DocPage,
  DocH1,
  DocH2,
  DocH3,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Steps,
  Step,
  Note,
  Tip,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/admin/questions"
      headings={[
        { id: "overview", label: "What admins can do", depth: 2 },
        { id: "folders", label: "Subject folders & question sets", depth: 2 },
        { id: "scope", label: "Seeing the whole institution", depth: 2 },
        { id: "creating", label: "Creating & generating questions", depth: 2 },
        { id: "types", label: "Question types", depth: 3 },
        {
          id: "assigning",
          label: "Publishing a set as a Test / Quiz / Exam",
          depth: 2,
        },
        { id: "csv", label: "CSV import", depth: 2 },
      ]}
    >
      <DocH1>Question library</DocH1>
      <DocLead>
        Administrators get the full question bank — the same subject folders, AI
        generation, and up-to-100-question sets teachers use, plus visibility
        across every instructor in the institution. Build a Test, Quiz, Exam or
        Assessment directly from the library and assign it to students.
      </DocLead>

      <DocH2 id="overview">What admins can do</DocH2>
      <DocP>
        Go to <strong>Dashboard → Question library</strong>. The workspace is
        identical to the teacher&apos;s, with one difference: you see{" "}
        <strong>all</strong> questions and sets in the institution, not just the
        ones you created. You can:
      </DocP>
      <DocUl>
        <DocLi>
          Add questions to a folder for <strong>every subject</strong> — a
          folder exists per subject even before it has any questions.
        </DocLi>
        <DocLi>
          Build <strong>question sets</strong> of up to{" "}
          <strong>100 questions</strong> per subject or per skill.
        </DocLi>
        <DocLi>
          <strong>Generate</strong> questions with AI, <strong>import</strong>{" "}
          them from CSV, or write them by hand.
        </DocLi>
        <DocLi>
          Publish a whole set straight into a{" "}
          <strong>Test, Quiz, Exam, or Assignment</strong> and assign it to
          students with a number of trials.
        </DocLi>
      </DocUl>

      <DocH2 id="folders">Subject folders &amp; question sets</DocH2>
      <DocP>
        In <strong>Folders</strong> view, every subject in the institution gets
        its own folder — exactly like the question bank in Bridgitus. Open a
        folder to see the questions and sets filed under that subject. A{" "}
        <strong>question set</strong> is a ready-made group of up to{" "}
        <strong>100 questions</strong> on one topic or skill, and it holds its
        own copy of every question, so editing a set never touches the wider
        library and vice-versa.
      </DocP>

      <DocH2 id="scope">Seeing the whole institution</DocH2>
      <DocP>
        Unlike teachers, admins see questions and sets created by{" "}
        <strong>every instructor</strong>. Each set shows who created it, so you
        can audit content quality, reuse a strong set across classes, or publish
        an institution-wide exam. Use the search and the subject / type /
        difficulty filters to narrow down thousands of questions.
      </DocP>
      <Note>
        Firestore security rules treat admin, manager, and teacher as staff —
        admins can edit or archive any question or set in their institution.
      </Note>

      <DocH2 id="creating">Creating &amp; generating questions</DocH2>
      <Steps>
        <Step n={1} title="Pick a folder">
          Choose the subject folder the questions belong to (or create the set
          first and assign its subject afterwards).
        </Step>
        <Step n={2} title="Add questions">
          <strong>Manually</strong> with the builder, <strong>from CSV</strong>{" "}
          (up to 100 per import), or <strong>with AI</strong> — describe the
          topic, difficulty, count and types, and Gemini drafts the set into the
          folder.
        </Step>
        <Step n={3} title="Review">
          Open the set to preview every question with correct answers, points,
          explanations and worked solutions.
        </Step>
      </Steps>

      <DocH3 id="types">Question types</DocH3>
      <DocTable
        headers={["Type", "Answer format", "Grading"]}
        rows={[
          ["MCQ", "Four options, one correct", "Auto — instant"],
          ["True / False", "Two buttons", "Auto — instant"],
          ["Short answer", "Accepted-answer strings", "Auto — matches"],
          ["Essay", "Rich-text response", "Manual"],
          [
            "Coding",
            "In-browser code (JS sandboxed)",
            "Auto for JS, else manual",
          ],
          ["Project", "File upload or GitHub URL", "Manual, with rubrics"],
        ]}
      />

      <DocH2 id="assigning">Publishing a set as a Test / Quiz / Exam</DocH2>
      <DocP>
        Open any set and click <strong>Use in assessment</strong> to jump to the
        builder with the whole set pre-selected, or assign directly from the
        bank: choose the <strong>kind</strong> (quiz, test, exam, or
        assignment), set the <strong>number of trials</strong> (max attempts),
        pick the target class or hand-selected students, and publish. Students
        see it immediately and get results the moment they submit.
      </DocP>
      <Tip>
        You can re-assign the same set as many times as you like — duplicate it
        into a fresh Test or Exam, or generate a new AI paper for a retake.
      </Tip>

      <DocH2 id="csv">CSV import</DocH2>
      <DocP>
        Go to <strong>Question library → Import CSV</strong>. Download the
        template, fill it in, and upload. Imported questions are filed into a
        set under the subject you pick — up to 100 questions per import. The
        column format is the same as the teacher&apos;s; see{" "}
        <strong>CSV formats</strong> in the reference section.
      </DocP>
    </DocPage>
  );
}
