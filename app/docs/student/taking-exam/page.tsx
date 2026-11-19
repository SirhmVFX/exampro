import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/taking-exam" headings={[
      { id: "before", label: "Before you start", depth: 2 },
      { id: "taking", label: "Taking the exam", depth: 2 },
      { id: "question-types", label: "Answering question types", depth: 2 },
      { id: "mcq", label: "MCQ & True/False", depth: 3 },
      { id: "keyboard", label: "Keyboard shortcuts (MCQ)", depth: 3 },
      { id: "short", label: "Short answer", depth: 3 },
      { id: "essay", label: "Essay", depth: 3 },
      { id: "coding", label: "Coding playground", depth: 3 },
      { id: "project", label: "Project", depth: 3 },
      { id: "timer", label: "Timer & autosave", depth: 2 },
      { id: "offline", label: "Offline & reconnection", depth: 2 },
      { id: "submitting", label: "Submitting", depth: 2 },
      { id: "integrity", label: "Integrity warnings", depth: 2 },
    ]}>
      <DocH1>Taking an exam</DocH1>
      <DocLead>A clean, full-screen experience. Your answers save automatically every 12 seconds — a dropped connection will not lose your work.</DocLead>

      <DocH2 id="before">Before you start</DocH2>
      <DocP>Check these before clicking Start:</DocP>
      <DocUl>
        <DocLi>Use a laptop or desktop if possible — especially for coding questions.</DocLi>
        <DocLi>Stable internet connection. Autosave retries on brief outages; if you go fully offline, your work is preserved until you reconnect.</DocLi>
        <DocLi>Close other tabs if the exam has tab-switch detection enabled.</DocLi>
        <DocLi>Allow camera access if prompted (webcam exam).</DocLi>
      </DocUl>

      <DocH2 id="taking">Taking the exam</DocH2>
      <Steps>
        <Step n={1} title="Find the assessment">Dashboard → <strong>Assessments</strong>. Click the exam you want to take.</Step>
        <Step n={2} title="Read the instructions">The description and any special notes appear above the questions.</Step>
        <Step n={3} title="Click Start">The timer starts (if there is one). You cannot pause it.</Step>
        <Step n={4} title="Answer each question">Scroll through all questions. You can go back and change answers at any time before submitting.</Step>
        <Step n={5} title="Submit when done">Click <strong>Submit exam</strong>. You will be asked to confirm. Once confirmed, the attempt is final.</Step>
      </Steps>
      <Warning>Once you click Submit and confirm, your attempt cannot be re-opened. Make sure you have answered everything before confirming.</Warning>

      <DocH2 id="question-types">Answering question types</DocH2>

      <DocH3 id="mcq">MCQ &amp; True/False</DocH3>
      <DocP>Click a button or option. Your selection highlights. Click another option to change it before submitting.</DocP>

      <DocH3 id="keyboard">Keyboard shortcuts (MCQ)</DocH3>
      <DocP>On MCQ questions you do not need to use the mouse. Use these keyboard shortcuts to select options quickly:</DocP>
      <DocUl>
        <DocLi>Keys <strong>1 2 3 4</strong> — select options 1, 2, 3, 4 respectively</DocLi>
        <DocLi>Keys <strong>A B C D</strong> — same as 1–4 (case-insensitive)</DocLi>
      </DocUl>
      <DocP>Each option shows a small key hint (e.g. <strong>1</strong>) on the right side so you always know which key corresponds to which choice.</DocP>
      <Tip>Keyboard shortcuts only fire when focus is not inside a text field. They work on all MCQ questions on the page simultaneously — the shortcut selects the option on the <em>first unanswered</em> MCQ, so answer questions in order for the best experience.</Tip>

      <DocH3 id="short">Short answer</DocH3>
      <DocP>Type your answer in the text field. ExamPro compares it case-insensitively against the teacher&apos;s accepted answers. Be precise — &quot;201 Created&quot; and &quot;201&quot; are different answers. If unsure of the exact phrasing, write what you know.</DocP>

      <DocH3 id="essay">Essay</DocH3>
      <DocP>A rich-text editor appears. You can format with bold, headings, and bullet lists. Your teacher grades this manually — write clearly and fully.</DocP>
      <DocP>As you type, a small <strong>Saving…</strong> indicator appears below the editor. After 1.5 seconds of no input it shows <strong>Saved ✓</strong>, confirming your draft has been captured by the autosave cycle. This is separate from the 12-second autosave — it is purely a visual confirmation that your latest text is in the queue.</DocP>

      <DocH3 id="coding">Coding playground</DocH3>
      <DocP>A code editor appears pre-filled with starter code. Write your solution. For JavaScript questions you can click <strong>Run</strong> to test against sample test cases before submitting. The language badge shows which language is expected.</DocP>
      <Tip>Your function must be named <strong>solve</strong>. Example: <code className="bg-white/8 px-1 rounded text-xs">function solve(n) {"{"} return n * 2; {"}"}</code></Tip>
      <DocP>For HTML questions, a live preview panel shows your output. For CSS, a styled preview box appears. Other languages are graded by your teacher.</DocP>

      <DocH3 id="project">Project</DocH3>
      <DocP>Upload a file (PDF, ZIP, image) using the upload button, or paste your GitHub repository URL. Add optional notes in the text field. Your teacher reviews and scores it manually.</DocP>

      <DocH2 id="timer">Timer &amp; autosave</DocH2>
      <DocP>If there is a time limit, a countdown shows at the top of the page. When it reaches zero, your exam <strong>auto-submits</strong> whatever you have answered — you do not need to do anything.</DocP>
      <DocP>Your answers autosave every 12 seconds in the background. Even if you lose connection briefly, your most recent autosave is intact in Firestore.</DocP>
      <Note>Students with extra-time accommodations see a longer timer. Your admin configures this on your profile.</Note>

      <DocH2 id="offline">Offline &amp; reconnection</DocH2>
      <DocP>If your internet drops mid-exam, ExamPro detects it immediately and shows an amber <strong>You are offline</strong> banner at the top of the page. The timer keeps counting but the <strong>Submit</strong> button is disabled until you reconnect.</DocP>
      <DocUl>
        <DocLi>Your answers are preserved — the last autosave stored them in Firestore before you went offline.</DocLi>
        <DocLi>Keep answering questions while offline — your inputs are held in memory.</DocLi>
        <DocLi>When internet returns, the banner disappears, the submit button re-enables, and the next autosave cycle will push your pending answers.</DocLi>
      </DocUl>
      <Tip>If you go offline and your timer runs out, the auto-submit will fire once you reconnect. Tell your teacher immediately so they can review the timestamp in the audit log.</Tip>

      <DocH2 id="submitting">Submitting</DocH2>
      <DocP>Click <strong>Submit exam</strong>. A confirmation dialog appears. Click <strong>Confirm submit</strong>. You are redirected to your results page (if results are shown immediately) or to the results list.</DocP>

      <DocH2 id="integrity">Integrity warnings</DocH2>
      <DocP>If the exam has integrity settings enabled you may see:</DocP>
      <DocUl>
        <DocLi><strong>Tab switch banner</strong> — appears when you return to the exam tab after switching away. The event is logged.</DocLi>
        <DocLi><strong>Leave confirmation dialog</strong> — appears if you try to close the tab or navigate away. Click <em>Stay</em> to continue.</DocLi>
        <DocLi><strong>Webcam preview</strong> — a small camera feed in the corner. Your teacher sees whether the camera was on or off — video is not recorded.</DocLi>
      </DocUl>
    </DocPage>
  );
}
