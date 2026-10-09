import { DocPage, DocH1, DocH2, DocLead, DocP, DocUl, DocLi, Steps, Step, Tip, Note } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/rubrics" headings={[
      { id: "what", label: "What is a rubric?", depth: 2 },
      { id: "creating", label: "Creating a rubric", depth: 2 },
      { id: "attaching", label: "Attaching to a question", depth: 2 },
      { id: "grading", label: "Grading with a rubric", depth: 2 },
    ]}>
      <DocH1>Rubrics</DocH1>
      <DocLead>Define scoring criteria for essays and projects so grading is consistent — even across multiple teachers.</DocLead>

      <DocH2 id="what">What is a rubric?</DocH2>
      <DocP>A rubric is a set of named criteria, each with a maximum point value. Instead of awarding a single score for an essay, you score each criterion separately. The total is the sum of criterion scores.</DocP>
      <DocP>Example rubric for a 20-point essay question:</DocP>
      <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs font-semibold text-white/50 uppercase">
            <tr><th className="px-4 py-3 text-left">Criterion</th><th className="px-4 py-3 text-left">Max points</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-white/70">
            {[["Clarity of argument", "6"], ["Use of evidence", "6"], ["Structure & organisation", "4"], ["Grammar & spelling", "4"]].map(([c, p]) => (
              <tr key={c}><td className="px-4 py-3">{c}</td><td className="px-4 py-3">{p}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocH2 id="creating">Creating a rubric</DocH2>
      <Steps>
        <Step n={1} title="Go to Rubrics">Dashboard → <strong>Rubrics → New rubric</strong>.</Step>
        <Step n={2} title="Name the rubric">E.g. "Essay grading — English", "Project grading — Frontend".</Step>
        <Step n={3} title="Add criteria">Click <strong>Add criterion</strong>. Enter a name, optional description, and the maximum points for that criterion.</Step>
        <Step n={4} title="Save">Click <strong>Save rubric</strong>. It appears in the rubric list and becomes available to attach to questions.</Step>
      </Steps>

      <DocH2 id="attaching">Attaching to a question</DocH2>
      <DocP>When creating or editing an Essay or Project question, find the <strong>Rubric</strong> field and select a rubric from the dropdown. The rubric&apos;s total max points replaces the question&apos;s points field.</DocP>
      <Note>One rubric can be attached to many questions. Editing a rubric after attaching it to questions does not retroactively update already-graded attempts.</Note>

      <DocH2 id="grading">Grading with a rubric</DocH2>
      <DocP>When you open a submission for a question with a rubric attached, you see each criterion as a separate input. Enter 0 to max for each. The question score auto-sums as you type.</DocP>
      <Tip>Add a feedback note per criterion (e.g. "Strong evidence used, but the citation format was wrong") — students see the per-criterion breakdown on their result page.</Tip>
    </DocPage>
  );
}
