import {
  DocPage,
  DocH1,
  DocH2,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Note,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/student/results"
      headings={[
        { id: "immediate", label: "Immediate results", depth: 2 },
        { id: "pending", label: "Pending manual grade", depth: 2 },
        { id: "detail", label: "Result detail page", depth: 2 },
        { id: "history", label: "Attempt history", depth: 2 },
      ]}
    >
      <DocH1>Results</DocH1>
      <DocLead>
        See your score, pass/fail status, and a question-by-question breakdown
        right after submitting — or once your teacher has finished grading.
      </DocLead>

      <DocH2 id="immediate">Immediate results</DocH2>
      <DocP>
        If your teacher enabled <strong>Show results immediately</strong>, you
        are redirected to your result page the moment you submit. You see:
      </DocP>
      <DocUl>
        <DocLi>Total score (e.g. 42 / 50)</DocLi>
        <DocLi>Percentage and Pass / Fail badge</DocLi>
        <DocLi>Time taken</DocLi>
        <DocLi>Per-question breakdown (see below)</DocLi>
      </DocUl>

      <DocH2 id="pending">Pending manual grade</DocH2>
      <DocP>
        If the assessment contains essay, project, or non-JavaScript coding
        questions, your result shows <strong>Pending manual grade</strong> until
        your teacher reviews those questions. MCQ and true/false scores are
        already visible — only the manual portions are pending.
      </DocP>
      <Note>
        Check back after your teacher has graded. You&apos;ll see the updated
        score when the status changes to <em>Graded</em>.
      </Note>

      <DocH2 id="detail">Result detail page</DocH2>
      <DocP>
        Go to <strong>Dashboard → Results</strong> and click any attempt to open
        the detail page. For each question you see:
      </DocP>
      <DocUl>
        <DocLi>The question text</DocLi>
        <DocLi>Your answer</DocLi>
        <DocLi>Points awarded / max points</DocLi>
        <DocLi>Correct / Incorrect badge (for auto-graded types)</DocLi>
        <DocLi>
          The explanation and worked solution (if your teacher added one)
        </DocLi>
        <DocLi>Teacher feedback (if your teacher left a comment)</DocLi>
        <DocLi>
          <strong>Practice similar</strong> — on any wrong answer, generate AI
          practice questions on the same topic to take corrections
        </DocLi>
      </DocUl>

      <DocH2 id="history">Attempt history</DocH2>
      <DocP>
        Dashboard → <strong>Results</strong> lists every attempt you&apos;ve
        made — sorted newest first. Each row shows the assessment title, date,
        score, percentage, and pass/fail. Click any row to open the detail page.
      </DocP>
      <DocP>
        If you&apos;ve taken an assessment multiple times (retakes), each
        attempt appears as a separate row. The gradebook uses your best score —
        not the most recent.
      </DocP>
    </DocPage>
  );
}
