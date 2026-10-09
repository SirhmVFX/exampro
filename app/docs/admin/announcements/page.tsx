import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/admin/announcements" headings={[
      { id: "sending", label: "Sending an announcement", depth: 2 },
      { id: "audience", label: "Audience targeting", depth: 2 },
      { id: "read-counts", label: "Read counts", depth: 2 },
      { id: "deleting", label: "Deleting", depth: 2 },
    ]}>
      <DocH1>Announcements</DocH1>
      <DocLead>Send rich-text messages to everyone, just students, just teachers, or one specific person. Students and teachers see them in the notification bell on their dashboard.</DocLead>

      <DocH2 id="sending">Sending an announcement</DocH2>
      <DocP>Go to <strong>Dashboard → Announcements</strong>. Fill in the form on the left:</DocP>
      <DocUl>
        <DocLi><strong>Audience</strong> — who receives the announcement (see below).</DocLi>
        <DocLi><strong>Title</strong> — a short subject line, shown in bold in the notification list.</DocLi>
        <DocLi><strong>Message</strong> — a rich-text editor. You can bold text, add headings, bullet lists, links, and images.</DocLi>
      </DocUl>
      <DocP>Click <strong>Send</strong>. The announcement appears in the Sent list on the right immediately.</DocP>

      <DocH2 id="audience">Audience targeting</DocH2>
      <DocUl>
        <DocLi><strong>Everyone</strong> — all active members of your institution (students, teachers, managers, parents).</DocLi>
        <DocLi><strong>All students</strong> — only users with the student role.</DocLi>
        <DocLi><strong>All teachers</strong> — only users with the teacher role.</DocLi>
        <DocLi><strong>A specific person</strong> — select one person from the dropdown. Useful for individual feedback or reminders.</DocLi>
      </DocUl>
      <Tip>Use "All students" when announcing exam timetables, and "All teachers" when sharing grading deadlines — keep it relevant to avoid notification fatigue.</Tip>

      <DocH2 id="read-counts">Read counts</DocH2>
      <DocP>Each sent announcement shows how many recipients have opened it. A notification is marked read when the user clicks it in their dashboard notification bell. The admin themselves are counted as having read it immediately on send.</DocP>
      <Note>Read counts update in real time. Refresh the Announcements page to see the latest number.</Note>

      <DocH2 id="deleting">Deleting</DocH2>
      <DocP>Click the trash icon next to any sent announcement to delete it. This removes it from the Sent list and from every recipient&apos;s notification bell immediately. Deleted announcements cannot be recovered.</DocP>
    </DocPage>
  );
}
