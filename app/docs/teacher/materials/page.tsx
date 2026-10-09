import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/materials" headings={[
      { id: "types", label: "Material types", depth: 2 },
      { id: "uploading", label: "Uploading a material", depth: 2 },
      { id: "student-view", label: "Student view", depth: 2 },
      { id: "completion", label: "Completion tracking", depth: 2 },
      { id: "prerequisite", label: "As a prerequisite", depth: 2 },
    ]}>
      <DocH1>Learning materials</DocH1>
      <DocLead>Upload documents, link videos, or write rich notes. Students mark them complete — you see who has and who hasn't.</DocLead>

      <DocH2 id="types">Material types</DocH2>
      <DocTable
        headers={["Type", "What it accepts", "How students see it"]}
        rows={[
          ["Document", "PDF, Word, PowerPoint, image — uploaded to Cloudinary", "Download or view in browser"],
          ["Video", "YouTube, Vimeo, or direct MP4 URL", "Embedded player"],
          ["Link", "Any URL", "Opens in new tab"],
          ["Note", "Rich text (written in the editor)", "Rendered HTML in the dashboard"],
        ]}
      />

      <DocH2 id="uploading">Uploading a material</DocH2>
      <DocP>Go to <strong>Dashboard → Materials → New material</strong>:</DocP>
      <DocUl>
        <DocLi><strong>Title</strong> — what students see in their materials list.</DocLi>
        <DocLi><strong>Description</strong> (optional) — a brief summary or instructions.</DocLi>
        <DocLi><strong>Type</strong> — Document, Video, Link, or Note.</DocLi>
        <DocLi><strong>Subject &amp; class</strong> — determines which students see it.</DocLi>
        <DocLi>For Document: click <strong>Upload file</strong>. Files up to 8 MB. Stored on Cloudinary.</DocLi>
        <DocLi>For Video/Link: paste the URL.</DocLi>
        <DocLi>For Note: write in the rich-text editor (supports headings, bold, lists, links, images).</DocLi>
      </DocUl>
      <Tip>For large PDF files, upload to Google Drive or Dropbox and use a Link material instead of Document — avoids the 8 MB file size limit.</Tip>

      <DocH2 id="student-view">Student view</DocH2>
      <DocP>Students see all materials for their class under <strong>Dashboard → Materials</strong>. Each card shows the title, type icon, description, and a <strong>Mark complete</strong> button.</DocP>

      <DocH2 id="completion">Completion tracking</DocH2>
      <DocP>When a student clicks <strong>Mark complete</strong>, ExamPro records the timestamp. You can see completion counts on the Materials list in your teacher dashboard.</DocP>
      <Note>Completion is self-reported — students mark it themselves. ExamPro does not track whether they actually read or watched the content.</Note>

      <DocH2 id="prerequisite">As a prerequisite</DocH2>
      <DocP>When creating or editing an assessment, the <strong>Required material</strong> field lets you pick one material. Students must mark it complete before the assessment unlocks for them.</DocP>
      <DocP>On the student&apos;s assessments page, a locked assessment shows a message:</DocP>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 my-4 text-sm text-amber-300">
        Complete <strong>[Material title]</strong> before taking this assessment.
      </div>
      <DocP>For more complex prerequisites (complete material A <em>and</em> pass assessment B), use <strong>Learning paths</strong>.</DocP>
    </DocPage>
  );
}
