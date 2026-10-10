import {
  DocPage,
  DocH1,
  DocH2,
  DocH3,
  DocLead,
  DocP,
  DocUl,
  DocLi,
  Note,
  Tip,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/teacher/materials"
      headings={[
        { id: "types", label: "Material types", depth: 2 },
        { id: "uploading", label: "Uploading a material", depth: 2 },
        { id: "assigning", label: "Assigning to students", depth: 2 },
        { id: "student-view", label: "Student view", depth: 2 },
        { id: "completion", label: "Completion tracking", depth: 2 },
        { id: "prerequisite", label: "As a prerequisite", depth: 2 },
      ]}
    >
      <DocH1>Learning materials</DocH1>
      <DocLead>
        Upload PDFs, link videos, or write rich notes. Assign to a whole class
        or hand-picked students — they mark them complete and you see who has
        and who hasn&apos;t.
      </DocLead>

      <DocH2 id="types">Material types</DocH2>
      <DocTable
        headers={["Type", "What it accepts", "How students see it"]}
        rows={[
          [
            "PDF",
            "PDF files — uploaded to Cloudinary",
            "Embedded in-app reader, plus open/download links",
          ],
          [
            "Document",
            "PDF, Word, PowerPoint, image — uploaded to Cloudinary",
            "Download or view in browser",
          ],
          ["Video", "YouTube, Vimeo, or direct MP4 URL", "Embedded player"],
          ["Link", "Any URL", "Opens in new tab"],
          [
            "Note",
            "Rich text (written in the editor)",
            "Rendered HTML in the dashboard",
          ],
        ]}
      />

      <DocH2 id="uploading">Uploading a material</DocH2>
      <DocP>
        Go to <strong>Dashboard → Materials → New material</strong>:
      </DocP>
      <DocUl>
        <DocLi>
          <strong>Title</strong> — what students see in their materials list.
        </DocLi>
        <DocLi>
          <strong>Description</strong> (optional) — a brief summary or
          instructions.
        </DocLi>
        <DocLi>
          <strong>Type</strong> — PDF, Document, Video, Link, or Rich-text note.
        </DocLi>
        <DocLi>
          <strong>Subject &amp; class</strong> — determines which students see
          it.
        </DocLi>
        <DocLi>
          <strong>Assign to</strong> — the entire class, or specific students
          (see below).
        </DocLi>
        <DocLi>
          For PDF/Document: click <strong>Upload</strong>. The original filename
          is kept and shown to students. Files up to 8 MB. Stored on Cloudinary.
        </DocLi>
        <DocLi>For Video/Link: paste the URL.</DocLi>
        <DocLi>
          For Note: write in the rich-text editor (supports headings, bold,
          lists, links, images).
        </DocLi>
      </DocUl>
      <Tip>
        For large PDF files, upload to Google Drive or Dropbox and use a Link
        material instead — avoids the 8 MB file size limit.
      </Tip>

      <DocH2 id="assigning">Assigning to students</DocH2>
      <DocP>
        By default a material goes to <strong>the entire class</strong> — every
        student in the selected class sees it. Switch to{" "}
        <strong>Specific students</strong> to hand-pick who receives it: search
        by name or class, tick the boxes (or use <em>Select shown</em>), and
        save. Students not on the list never see the material anywhere in their
        dashboard.
      </DocP>
      <DocP>
        Your materials list shows an <strong>N students</strong> badge on
        anything assigned to specific students, so you can spot differentiated
        resources at a glance.
      </DocP>

      <DocH2 id="student-view">Student view</DocH2>
      <DocP>
        Students see materials for their class — plus anything assigned to them
        personally — under <strong>Dashboard → Materials</strong>. Each card
        shows the title, type icon, description, and a{" "}
        <strong>Mark complete</strong> button. PDFs open in an embedded reader
        right on the card, with download and open-in-new-tab options.
      </DocP>

      <DocH2 id="completion">Completion tracking</DocH2>
      <DocP>
        When a student clicks <strong>Mark complete</strong>, ExamPro records
        the timestamp. You can see completion counts on the Materials list in
        your teacher dashboard.
      </DocP>
      <Note>
        Completion is self-reported — students mark it themselves. ExamPro does
        not track whether they actually read or watched the content.
      </Note>

      <DocH2 id="prerequisite">As a prerequisite</DocH2>
      <DocP>
        When creating or editing an assessment, the{" "}
        <strong>Required material</strong> field lets you pick one material.
        Students must mark it complete before the assessment unlocks for them.
      </DocP>
      <DocP>
        On the student&apos;s assessments page, a locked assessment shows a
        message:
      </DocP>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 my-4 text-sm text-amber-300">
        Complete <strong>[Material title]</strong> before taking this
        assessment.
      </div>
      <DocP>
        For more complex prerequisites (complete material A <em>and</em> pass
        assessment B), use <strong>Learning paths</strong>.
      </DocP>
    </DocPage>
  );
}
