import {
  DocPage,
  DocH1,
  DocH2,
  DocLead,
  DocP,
  Steps,
  Step,
  Note,
  Tip,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/admin/materials"
      headings={[
        { id: "overview", label: "What admins can do", depth: 2 },
        { id: "types", label: "Material types", depth: 2 },
        { id: "adding", label: "Adding a material", depth: 2 },
        { id: "assigning", label: "Assigning to students", depth: 2 },
        { id: "progress", label: "Progress & completion tracking", depth: 2 },
      ]}
    >
      <DocH1>Learning materials</DocH1>
      <DocLead>
        Add resources as rich text, PDFs, or links and assign them to students —
        the same materials module teachers use, with institution-wide
        visibility. Students study them, mark them complete, and you track who
        has.
      </DocLead>

      <DocH2 id="overview">What admins can do</DocH2>
      <DocP>
        Go to <strong>Dashboard → Materials</strong>. Admins see{" "}
        <strong>every</strong> material in the institution, not just the ones
        they created, and can add, edit, assign, and archive any of them. Assign
        a resource to a whole class or to hand-picked students, then watch
        completion roll up as students work through it.
      </DocP>

      <DocH2 id="types">Material types</DocH2>
      <DocTable
        headers={["Type", "What it accepts", "How students see it"]}
        rows={[
          [
            "Note / Rich text",
            "Written in the editor (headings, bold, lists, links, images)",
            "Rendered HTML in the dashboard",
          ],
          [
            "PDF",
            "PDF files — uploaded to Cloudinary",
            "Embedded in-app reader plus download",
          ],
          [
            "Document",
            "PDF, Word, PowerPoint, image",
            "Download or view in browser",
          ],
          ["Video", "YouTube, Vimeo, or direct MP4 URL", "Embedded player"],
          ["Link", "Any URL", "Opens in a new tab"],
        ]}
      />

      <DocH2 id="adding">Adding a material</DocH2>
      <Steps>
        <Step n={1} title="New material">
          Dashboard → Materials → <strong>New material</strong>.
        </Step>
        <Step n={2} title="Title &amp; description">
          The title is what students see; add an optional summary or
          instructions.
        </Step>
        <Step n={3} title="Choose the type">
          Rich-text note, PDF/Document upload, Video, or Link. For uploads,
          files up to 8 MB go to Cloudinary and keep their original name.
        </Step>
        <Step n={4} title="Subject &amp; class">
          Determines which students see it.
        </Step>
        <Step n={5} title="Assign &amp; save">
          Send it to the whole class or specific students.
        </Step>
      </Steps>

      <DocH2 id="assigning">Assigning to students</DocH2>
      <DocP>
        By default a material goes to <strong>the entire class</strong>. Switch
        to <strong>Specific students</strong> to hand-pick recipients — search
        by name or class and tick the boxes. Students not on the list never see
        it. The list shows an <strong>N students</strong> badge on anything
        assigned to specific people.
      </DocP>

      <DocH2 id="progress">Progress &amp; completion tracking</DocH2>
      <DocP>
        When a student opens a material and clicks{" "}
        <strong>Mark complete</strong>, ExamPro records the timestamp and rolls
        it into that student&apos;s progress and the material&apos;s completion
        count — visible to you in the Materials list and in analytics.
      </DocP>
      <Note>
        Completion is self-reported — the student marks it themselves. ExamPro
        records that they did, not how long they spent.
      </Note>
      <Tip>
        Pair materials with assessments: set a material as a{" "}
        <strong>Required material</strong> on an assessment so students must
        finish reading it before a Test or Exam unlocks.
      </Tip>
    </DocPage>
  );
}
