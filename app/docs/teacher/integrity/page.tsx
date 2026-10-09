import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, Warning, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/integrity" headings={[
      { id: "settings", label: "Integrity settings", depth: 2 },
      { id: "tab-warning", label: "Tab-switch detection", depth: 3 },
      { id: "confirm-leave", label: "Confirm on leave", depth: 3 },
      { id: "webcam", label: "Webcam logging", depth: 3 },
      { id: "lock-on-submit", label: "Lock on submit", depth: 3 },
      { id: "reviewing", label: "Reviewing integrity events", depth: 2 },
      { id: "limitations", label: "Limitations", depth: 2 },
    ]}>
      <DocH1>Integrity settings</DocH1>
      <DocLead>ExamPro logs student behaviour during an exam and presents it to you after submission. It deters casual dishonesty without blocking the exam or requiring special software.</DocLead>

      <DocH2 id="settings">Integrity settings</DocH2>
      <DocP>When creating or editing an assessment, expand the <strong>Integrity</strong> section. You can enable any combination of the four options below.</DocP>

      <DocH3 id="tab-warning">Tab-switch detection</DocH3>
      <DocP>Every time the student switches to another browser tab or window (the page becomes hidden), an event is logged with a timestamp. When they return, a banner appears:</DocP>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 my-4 text-sm text-amber-300 font-medium">
        ⚠ Tab switch recorded. Stay on this page until you submit.
      </div>
      <DocP>This does not block the student — it warns them and creates a visible record for you.</DocP>

      <DocH3 id="confirm-leave">Confirm on leave</DocH3>
      <DocP>Triggers the browser&apos;s native "Leave page?" dialog if the student tries to close the tab, navigate away, or refresh during the exam. Each triggered dialog logs a <code className="bg-white/8 px-1 rounded text-xs">leave_attempt</code> event.</DocP>
      <Note>Modern browsers limit what text can appear in this dialog — it shows the browser&apos;s default wording, not a custom message.</Note>

      <DocH3 id="webcam">Webcam logging</DocH3>
      <DocP>When enabled, the student&apos;s browser requests camera permission at the start of the exam. A small live preview appears in the corner of their screen during the exam. ExamPro logs whether the camera was granted (<code className="bg-white/8 px-1 rounded text-xs">webcam_on</code>) or denied (<code className="bg-white/8 px-1 rounded text-xs">webcam_off</code>).</DocP>
      <Warning>Video is <strong>not recorded or uploaded</strong>. Only the presence/absence event is logged. This is intentional — recording requires bandwidth many institutions don&apos;t have reliably.</Warning>

      <DocH3 id="lock-on-submit">Lock on submit</DocH3>
      <DocP>After the student submits, their attempt is marked <em>locked</em>. Locked attempts cannot be reopened or edited by the student. Use this for high-stakes exams where you want to prevent post-submission tampering.</DocP>

      <DocH2 id="reviewing">Reviewing integrity events</DocH2>
      <DocP>Go to <strong>Dashboard → Submissions</strong> and open any submission. At the top of the page, the <strong>Integrity</strong> panel shows:</DocP>
      <DocUl>
        <DocLi>Total tab-switch events</DocLi>
        <DocLi>Total leave-attempt events</DocLi>
        <DocLi>Whether webcam was on or off</DocLi>
        <DocLi>Time taken vs. allotted time</DocLi>
      </DocUl>
      <DocP>These numbers are contextual — a student with 2 tab switches who finished in 80% of the time is very different from one with 12 switches. Use your judgement.</DocP>

      <DocH2 id="limitations">Limitations</DocH2>
      <DocUl>
        <DocLi>Tab detection only fires when the page becomes hidden — a second monitor or a phone is not detected.</DocLi>
        <DocLi>Confirm-on-leave can be dismissed; it does not prevent leaving.</DocLi>
        <DocLi>Webcam presence does not prove the right person is in front of the camera.</DocLi>
        <DocLi>Integrity settings only apply to the browser session — a student using two devices simultaneously is not detected.</DocLi>
      </DocUl>
      <Tip>Integrity features are most effective as a deterrent. Combine them with randomised question order and unique question pools for stronger protection.</Tip>
    </DocPage>
  );
}
