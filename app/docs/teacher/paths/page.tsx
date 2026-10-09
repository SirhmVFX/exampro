import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Tip, Steps, Step } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/paths" headings={[
      { id: "what", label: "What is a learning path?", depth: 2 },
      { id: "creating", label: "Creating a path", depth: 2 },
      { id: "gating", label: "Gating (required items)", depth: 2 },
      { id: "student-view", label: "Student view", depth: 2 },
    ]}>
      <DocH1>Learning paths</DocH1>
      <DocLead>Sequence materials and assessments into an ordered curriculum. Mark items as required to gate progress — students must pass before moving on.</DocLead>

      <DocH2 id="what">What is a learning path?</DocH2>
      <DocP>A learning path is an ordered list of materials and assessments. It works like a curriculum module — you define what students do and in what order. Optional gating enforces the order: if item 2 is required, students can&apos;t access item 3 until they&apos;ve completed item 2.</DocP>

      <DocH2 id="creating">Creating a path</DocH2>
      <Note>Admins manage learning paths from <strong>Dashboard → Paths</strong>. The creation UI is on the admin dashboard, not the teacher dashboard.</Note>
      <Steps>
        <Step n={1} title="Go to Admin → Paths">Dashboard → <strong>Paths → New path</strong>.</Step>
        <Step n={2} title="Add a title and description">E.g. "Frontend Week 3 — CSS Layouts". The description appears to students.</Step>
        <Step n={3} title="Select a target class">(Optional) Scope the path to one class, or leave blank for all classes.</Step>
        <Step n={4} title="Add items">Use the <em>Add material</em> and <em>Add assessment</em> dropdowns to pick items. They appear in the order added.</Step>
        <Step n={5} title="Set required items">Tick the <strong>Gate</strong> checkbox on any item to make it required before the next one unlocks.</Step>
        <Step n={6} title="Save">Click <strong>Save path</strong>. Students in the target class see it immediately.</Step>
      </Steps>

      <DocH2 id="gating">Gating (required items)</DocH2>
      <DocP>When an item is marked as required (<strong>Gate = on</strong>):</DocP>
      <DocUl>
        <DocLi>For a <strong>material</strong> — the student must mark it complete before the next item is accessible.</DocLi>
        <DocLi>For an <strong>assessment</strong> — the student must submit (and pass, if a pass % is set) before the next item unlocks.</DocLi>
      </DocUl>
      <Tip>You don&apos;t have to gate every item. Leave some as optional enrichment — gate only the core ones that students must complete to progress.</Tip>

      <DocH2 id="student-view">Student view</DocH2>
      <DocP>Students see the path in their <strong>Dashboard → Materials</strong> section. Each item shows as a card with:</DocP>
      <DocUl>
        <DocLi>A lock icon if it&apos;s gated and the prerequisite isn&apos;t met yet</DocLi>
        <DocLi>A checkmark when completed</DocLi>
        <DocLi>A progress bar showing overall path completion</DocLi>
      </DocUl>
    </DocPage>
  );
}
