import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Note, Tip } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/student/materials" headings={[
      { id: "viewing", label: "Viewing materials", depth: 2 },
      { id: "completing", label: "Marking complete", depth: 2 },
      { id: "gated", label: "Gated assessments", depth: 2 },
    ]}>
      <DocH1>Learning materials</DocH1>
      <DocLead>Your teacher uploads documents, videos, and notes here. Complete them to unlock gated assessments.</DocLead>

      <DocH2 id="viewing">Viewing materials</DocH2>
      <DocP>Go to <strong>Dashboard → Materials</strong>. You see all materials your teacher has published for your class, sorted by type. Click a card to:</DocP>
      <DocUl>
        <DocLi><strong>Document</strong> — opens a download/view link for the PDF or file.</DocLi>
        <DocLi><strong>Video</strong> — an embedded player appears (YouTube, Vimeo, or MP4).</DocLi>
        <DocLi><strong>Link</strong> — opens the URL in a new tab.</DocLi>
        <DocLi><strong>Note</strong> — the rich-text content expands inline.</DocLi>
      </DocUl>

      <DocH2 id="completing">Marking complete</DocH2>
      <DocP>Each material card has a <strong>Mark complete</strong> button. Click it after you&apos;ve read/watched the content. The card shows a green checkmark and the button changes to <em>Completed</em>.</DocP>
      <Note>Completion is self-reported — ExamPro trusts you to mark it when you&apos;re done, not just to click the button and move on.</Note>

      <DocH2 id="gated">Gated assessments</DocH2>
      <DocP>If a teacher has made a material a prerequisite for an assessment, you&apos;ll see a lock icon on the assessment card:</DocP>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 my-4 text-sm text-amber-300">
        Complete <strong>[Material name]</strong> to unlock this assessment.
      </div>
      <DocP>Mark the required material complete and the lock disappears. Refresh the assessments page if it doesn&apos;t update automatically.</DocP>
      <Tip>If you&apos;ve marked a material complete but the assessment is still locked, it may also require you to pass a previous assessment. Check the description for details.</Tip>
    </DocPage>
  );
}
