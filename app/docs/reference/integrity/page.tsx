import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, DocTable, Note, Warning } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/reference/integrity" headings={[
      { id: "settings", label: "All integrity settings", depth: 2 },
      { id: "events", label: "Event log", depth: 2 },
      { id: "limits", label: "What it can't detect", depth: 2 },
    ]}>
      <DocH1>Integrity suite reference</DocH1>
      <DocLead>Full reference for every integrity setting, the events it logs, and honest notes on what it cannot detect.</DocLead>

      <DocH2 id="settings">All integrity settings</DocH2>
      <DocTable
        headers={["Setting", "What it does", "What it logs"]}
        rows={[
          ["Tab-switch warning", "Shows a banner when student returns after switching tabs. Does not block.", "tab_blur (left), tab_focus (returned)"],
          ["Confirm on leave", "Triggers browser 'Leave page?' dialog on close/navigate/refresh.", "leave_attempt"],
          ["Webcam logging", "Requests camera permission, shows live preview in corner of exam.", "webcam_on or webcam_off"],
          ["Lock on submit", "Marks attempt as locked after submit — cannot be reopened.", "(no event — status flag)"],
        ]}
      />

      <DocH2 id="events">Event log</DocH2>
      <DocP>All events are stored in the attempt&apos;s <code className="bg-white/8 px-1 rounded text-xs">events</code> array with a Unix timestamp. Teachers see a summary count in the Submissions detail view.</DocP>
      <DocTable
        headers={["Event type", "When it fires"]}
        rows={[
          ["start", "Student clicks Start for the first time"],
          ["resume", "Student reopens an in-progress attempt"],
          ["autosave", "Every 12 seconds while taking the exam"],
          ["tab_blur", "Student switches to another tab/window"],
          ["tab_focus", "Student returns to the exam tab"],
          ["leave_attempt", "Student triggers the leave confirmation dialog"],
          ["webcam_on", "Camera permission granted"],
          ["webcam_off", "Camera permission denied"],
          ["submit", "Student successfully submits the attempt"],
        ]}
      />

      <DocH2 id="limits">What it can&apos;t detect</DocH2>
      <DocUl>
        <DocLi>A second monitor or phone — the student can look at notes on another screen</DocLi>
        <DocLi>Another person in the room</DocLi>
        <DocLi>Screenshot tools (not a tab switch in most OS)</DocLi>
        <DocLi>Another device running the same exam simultaneously</DocLi>
        <DocLi>The identity of the person in front of the webcam</DocLi>
      </DocUl>
      <Warning>Integrity features are a deterrent, not a guarantee. For truly high-stakes exams, combine them with in-person invigilation or a dedicated proctoring service.</Warning>
    </DocPage>
  );
}
