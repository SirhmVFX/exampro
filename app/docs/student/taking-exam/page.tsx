import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Steps, Step, Note, Tip, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/taking-exam" headings={[
      { id: "before", label: "Before you start", depth: 2 },
      { id: "taking", label: "Taking the exam", depth: 2 },
      { id: "question-types", label: "Answering question types", depth: 2 },
      { id: "mcq", label: "MCQ & True/False", depth: 3 },
      { id: "short", label: "Short answer", depth: 3 },
      { id: "essay", label: "Essay", depth: 3 },
      { id: "coding", label: "Coding playground", depth: 3 },
      { id: "project", label: "Project", depth: 3 },
      { id: "timer", label: "Timer & autosave", depth: 2 },
      { id: "submitting", label: "Submitting", depth: 2 },
      { id: "integrity", label: "Integrity warnings", depth: 2 },
    ]}>
      <DocH1>Taking an exam</DocH1>
      <DocLead>A clean, full-screen experience. Your answers save automatically every 12 seconds — a dropped connection won't lose your work.</DocLead>

      <DocH2 id="before">Before you start</DocH2>
      <DocP>Check these before clicking Start:</DocP>
      <DocUl>
        <DocLi>Use a laptop or desktop if possible — especially for coding questions.</DocLi>
        <DocLi>Stable internet connection. Autosave will retry if it fails briefly, but a complete outage during submit can cause issues.</DocLi>
        <DocLi>Close other tabs if the exam has tab-switch detection enabled.</DocLi>
        <DocLi>Allow camera access if prompted (webcam exam).</DocLi>
      </DocUl>

      <DocH2 id="taking">Taking the exam</DocH2>
      <Steps>
        <Step n={1} title="Find the assessment">Dashboard → <strong>Assessments</strong>. Click the exam you want to take.</Step>
        <Step n={2} title="Read the instructions">The description and any special notes appear above the questions.</Step>
        <Step n={3} title="Click Start">The timer starts (if there is one). You can&apos;t pause it.</Step>
        <Step n={4} title="Answer each question">Scroll through all questions. You can go back and change answers.</Step>
        <Step n={5} title="Submit when done">Click <strong>Submit exam</strong>. You&apos;ll be asked to confirm. Once confirmed, the attempt is final.</Step>
      </Steps>
      <Warning>Once you click Submit and confirm, your attempt cannot be re-opened. Make sure you&apos;ve answered everything before confirming.</Warning>

      <DocH2 id="question-types">Answering question types</DocH2>

      <DocH3 id="mcq">MCQ &amp; True/False</DocH3>
      <DocP>Click a button or option. Your selection highlights. Click again or click another option to change it before submitting.</DocP>

      <DocH3 id="short">Short answer</DocH3>
      <DocP>Type your answer in the text field. ExamPro compares it case-insensitively against the teacher&apos;s accepted answers. Be precise — "201 Created" and "201" are different answers. If unsure of the exact phrasing, write what you know.</DocP>

      <DocH3 id="essay">Essay</DocH3>
      <DocP>A rich-text editor appears. You can format with bold, headings, and bullet lists. Your teacher grades this manually — write clearly and fully.</DocP>

      <DocH3 id="coding">Coding playground</DocH3>
      <DocP>A code editor appears pre-filled with starter code. Write your solution. For JavaScript questions you can click <strong>Run</strong> to test against sample test cases before submitting. The language badge shows which language is expected.</DocP>
      <Tip>Your function must be named <strong>solve</strong>. Example: <code className="bg-white/8 px-1 rounded text-xs">function solve(n) {"{"} return n * 2; {"}"}</code></Tip>
      <DocP>For HTML questions, a live preview panel shows your output. For CSS, a styled preview box appears. Other languages are graded by your teacher.</DocP>

      <DocH3 id="project">Project</DocH3>
      <DocP>Upload a file (PDF, ZIP, image) using the upload button, or paste your GitHub repository URL. Add optional notes in the text field. Your teacher reviews and scores it manually.</DocP>

      <DocH2 id="timer">Timer &amp; autosave</DocH2>
      <DocP>If there is a time limit, a countdown shows in the top-right corner. When it reaches zero, your exam <strong>auto-submits</strong> whatever you&apos;ve answered — you don&apos;t need to do anything.</DocP>
      <DocP>Your answers autosave every 12 seconds. If you lose internet connection and reconnect, your last autosave is intact.</DocP>
      <Note>Students with extra-time accommodations see a longer timer. Your admin configures this on your profile.</Note>

      <DocH2 id="submitting">Submitting</DocH2>
      <DocP>Click <strong>Submit exam</strong>. A confirmation dialog appears. Click <strong>Confirm submit</strong>. You&apos;re redirected to your results page (if results are shown immediately) or to the results list.</DocP>

      <DocH2 id="integrity">Integrity warnings</DocH2>
      <DocP>If the exam has integrity settings enabled you may see:</DocP>
      <DocUl>
        <DocLi><strong>Tab switch banner</strong> — appears when you return to the exam tab after switching away. The event is logged.</DocLi>
        <DocLi><strong>Leave confirmation dialog</strong> — appears if you try to close the tab or navigate away. Click <em>Stay</em> to continue, or <em>Leave</em> to exit (and log an event).</DocLi>
        <DocLi><strong>Webcam preview</strong> — a small camera feed in the corner. Your teacher sees whether the camera was on or off — video is not recorded.</DocLi>
      </DocUl>
    </DocPage>
  );
}
