import { DocPage, DocH1, DocH2, DocH3, DocLead, DocP, DocUl, DocLi, Note, Tip, Warning, DocTable } from "../../doc-components";

export default function Page() {
  return (
    <DocPage href="/docs/teacher/ai" headings={[
      { id: "how-it-works", label: "How it works", depth: 2 },
      { id: "generating", label: "Generating questions", depth: 2 },
      { id: "reviewing", label: "Reviewing & saving", depth: 2 },
      { id: "quotas", label: "Generation quotas", depth: 2 },
      { id: "tips", label: "Tips for better results", depth: 2 },
    ]}>
      <DocH1>AI question generation</DocH1>
      <DocLead>Let Google Gemini write the first draft. You describe the topic — the AI returns a batch of ready-to-edit questions in seconds.</DocLead>

      <DocH2 id="how-it-works">How it works</DocH2>
      <DocP>ExamPro sends your prompt (subject, topic, difficulty, question type, count) to Google Gemini via a secure server-side API call. Gemini returns a structured JSON array of questions. You review each one and choose what to save. Nothing is saved automatically.</DocP>
      <Note>AI generation requires a <code className="bg-white/8 px-1 rounded text-xs">GEMINI_API_KEY</code> to be configured by your administrator. If the button is disabled or shows an error, contact your admin.</Note>

      <DocH2 id="generating">Generating questions</DocH2>
      <DocP>Go to <strong>Dashboard → Questions</strong> and click <strong>Generate with AI</strong>. Fill in the generation form:</DocP>
      <DocTable
        headers={["Field", "Description"]}
        rows={[
          ["Subject", "Which subject these questions belong to."],
          ["Class", "The target student group — influences vocabulary and difficulty."],
          ["Topic", "Optional. A specific chapter, module, or theme (e.g. 'Photosynthesis', 'HTTP methods')."],
          ["Question type", "MCQ, True/False, Short answer, Essay, or Coding (JavaScript)."],
          ["Difficulty", "Easy, Medium, or Hard. Affects complexity and language used."],
          ["Count", "How many questions to generate. Maximum 20 per request."],
          ["Language", "For coding questions only — currently JavaScript."],
        ]}
      />
      <DocP>Click <strong>Generate</strong>. The request takes 3–8 seconds. A loading spinner shows while Gemini is thinking.</DocP>

      <DocH2 id="reviewing">Reviewing &amp; saving</DocH2>
      <DocP>Each generated question appears as a card. For every question you can:</DocP>
      <DocUl>
        <DocLi><strong>Edit inline</strong> — click any field to change the text, options, correct answer, or points before saving.</DocLi>
        <DocLi><strong>Save to library</strong> — adds it to your question library tagged with the subject and class you specified.</DocLi>
        <DocLi><strong>Discard</strong> — dismiss it. It never enters your library.</DocLi>
      </DocUl>
      <Tip>Always read AI-generated questions before saving. Gemini occasionally produces plausible-sounding but incorrect answer keys, especially for niche topics. Treat it as a starting point, not a finished product.</Tip>

      <DocH2 id="quotas">Generation quotas</DocH2>
      <DocP>Each plan has a monthly AI generation quota shared across all teachers in the institution:</DocP>
      <DocTable
        headers={["Plan", "AI generations / month"]}
        rows={[
          ["Free", "20"],
          ["Starter", "200"],
          ["Growth", "Unlimited"],
          ["Enterprise", "Unlimited"],
        ]}
      />
      <DocP>Each generation request consumes one quota unit regardless of how many questions you ask for (1 or 20). The admin sees current usage in <strong>Dashboard → Billing → Current plan</strong>.</DocP>
      <Warning>Once the monthly quota is exhausted, the Generate button shows an error until the next billing cycle. Upgrade your plan to increase the quota.</Warning>

      <DocH2 id="tips">Tips for better results</DocH2>
      <DocUl>
        <DocLi><strong>Be specific with topic</strong> — "Binary search trees" beats "Data structures".</DocLi>
        <DocLi><strong>Match difficulty to your students</strong> — Hard for a university exam, Easy for a quick class recap.</DocLi>
        <DocLi><strong>Generate in small batches</strong> — 5 questions at a time is easier to review than 20.</DocLi>
        <DocLi><strong>Use coding type for technical courses</strong> — Gemini writes reasonable JavaScript function stubs with test cases.</DocLi>
        <DocLi><strong>Re-generate if quality is poor</strong> — run the same prompt again for a fresh set.</DocLi>
      </DocUl>
    </DocPage>
  );
}
