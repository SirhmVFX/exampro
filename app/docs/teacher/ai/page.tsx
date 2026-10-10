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
  Warning,
  DocTable,
} from "../../doc-components";

export default function Page() {
  return (
    <DocPage
      href="/docs/teacher/ai"
      headings={[
        { id: "how-it-works", label: "How it works", depth: 2 },
        { id: "generating", label: "Generating questions", depth: 2 },
        { id: "reviewing", label: "Reviewing & saving", depth: 2 },
        { id: "quotas", label: "Generation quotas", depth: 2 },
        { id: "troubleshooting", label: "Troubleshooting", depth: 2 },
        { id: "tips", label: "Tips for better results", depth: 2 },
      ]}
    >
      <DocH1>AI question generation</DocH1>
      <DocLead>
        Let Google Gemini write the first draft. You describe the subject and
        topic — the AI returns up to 100 ready-to-edit questions with answers
        and worked solutions.
      </DocLead>

      <DocH2 id="how-it-works">How it works</DocH2>
      <DocP>
        ExamPro sends your prompt (subject, class, topic, skill, difficulty,
        question type, context, count) to Google Gemini via a secure server-side
        API call. Large requests are automatically split into batches of 15
        questions so nothing gets truncated — a 100-question paper simply runs
        several batches one after another. Gemini returns a structured JSON
        array of questions with options, answers, explanations, and worked
        solutions. You review each one and choose what to save. Nothing is saved
        automatically.
      </DocP>
      <Note>
        AI generation requires a{" "}
        <code className="bg-white/8 px-1 rounded text-xs">GEMINI_API_KEY</code>{" "}
        to be configured by your administrator. If the button is disabled or
        shows an error, contact your admin.
      </Note>

      <DocH2 id="generating">Generating questions</DocH2>
      <DocP>
        Go to <strong>Dashboard → Questions</strong> and click{" "}
        <strong>Generate with AI</strong>. Fill in the generation form:
      </DocP>
      <DocTable
        headers={["Field", "Description"]}
        rows={[
          [
            "Subject",
            "Which subject these questions belong to. Sets the folder the generated set is filed under.",
          ],
          [
            "Class",
            "The target student group — influences vocabulary and difficulty.",
          ],
          [
            "Topic",
            "Optional. A specific chapter, module, or theme (e.g. 'Photosynthesis', 'HTTP methods').",
          ],
          [
            "Skill",
            "Optional. Maps the set to an institution skill for progress tracking.",
          ],
          [
            "Question type",
            "MCQ, True/False, Short answer, Essay, Coding (JavaScript), or Mixed — a blend of types.",
          ],
          [
            "Difficulty",
            "Easy, Medium, or Hard — or school-style Support / Core / Extension tiers.",
          ],
          ["Count", "How many questions to generate. Up to 100 per request."],
          [
            "Context",
            "Real-life, Exam-style, or Problem-solving — shapes how scenarios are framed.",
          ],
          [
            "Extra instructions",
            "Optional free-text prompt for anything else (e.g. 'focus on word problems').",
          ],
        ]}
      />
      <DocP>
        Click <strong>Generate</strong>. Small requests finish in a few seconds;
        a full 100-question run takes a little longer because the batches run in
        sequence. A progress indicator shows while Gemini is working.
      </DocP>

      <DocH2 id="reviewing">Reviewing &amp; saving</DocH2>
      <DocP>
        Each generated question appears as a review card showing the question
        text, every option with the correct answer marked, accepted answers, the
        explanation, and the worked solution. After reviewing you can:
      </DocP>
      <DocUl>
        <DocLi>
          <strong>Save as a question set</strong> — files all kept questions
          into the subject folder as a set of up to 100 questions. Sets are
          reusable across assessments.
        </DocLi>
        <DocLi>
          <strong>Also add to library</strong> — tick this to copy the kept
          questions into your standalone library as well.
        </DocLi>
        <DocLi>
          <strong>Assign as assessment</strong> — pick the kind (quiz, test,
          exam, or assignment), set the number of trials, choose students, and
          publish immediately.
        </DocLi>
      </DocUl>
      <Tip>
        Always read AI-generated questions before saving. Gemini occasionally
        produces plausible-sounding but incorrect answer keys, especially for
        niche topics. Treat it as a starting point, not a finished product.
      </Tip>

      <DocH2 id="quotas">Generation quotas</DocH2>
      <DocP>
        Each plan has a monthly AI generation quota shared across all teachers
        in the institution:
      </DocP>
      <DocTable
        headers={["Plan", "AI generations / month"]}
        rows={[
          ["Free", "20"],
          ["Starter", "200"],
          ["Growth", "Unlimited"],
          ["Enterprise", "Unlimited"],
        ]}
      />
      <DocP>
        Each generation request consumes one quota unit regardless of how many
        questions you ask for (1 or 100). The admin sees current usage in{" "}
        <strong>Dashboard → Billing → Current plan</strong>.
      </DocP>
      <Warning>
        Once the monthly quota is exhausted, the Generate button shows an error
        until the next billing cycle. Upgrade your plan to increase the quota.
      </Warning>

      <DocH2 id="troubleshooting">Troubleshooting</DocH2>
      <DocP>
        The generator checks your form before it spends a quota unit, so most
        errors are shown inline in the dialog:
      </DocP>
      <DocTable
        headers={["Message", "What it means / what to do"]}
        rows={[
          [
            '"Choose or type a subject before generating."',
            "The Subject field is empty — pick it from the dropdown or type it.",
          ],
          [
            '"Pick a question type."',
            "Select MCQ, True/False, Short answer, Essay, Coding, or Mixed.",
          ],
          [
            '"Enter how many questions you want (1–100)."',
            "The Count field was cleared — set it between 1 and 100.",
          ],
          [
            '"No institution is loaded — refresh the page and try again."',
            "Your session's institution data hadn't finished loading. Refresh; if it persists, sign out and back in.",
          ],
          [
            '"You\'ve used all N AI generations on the X plan this cycle."',
            "Plan quota exhausted — see Generation quotas above.",
          ],
          [
            '"GEMINI_API_KEY is not configured on the server."',
            "Your administrator hasn't set the API key. Contact them.",
          ],
          [
            '"Gemini API error (4xx): …"',
            "The upstream AI model rejected the request (rare key/model issues). Your admin can point ExamPro at a different model with the GEMINI_MODEL environment variable.",
          ],
        ]}
      />
      <Note>
        A rejected run does <strong>not</strong> consume quota — the counter
        only increases when questions come back successfully.
      </Note>

      <DocH2 id="tips">Tips for better results</DocH2>
      <DocUl>
        <DocLi>
          <strong>Be specific with topic</strong> — "Binary search trees" beats
          "Data structures".
        </DocLi>
        <DocLi>
          <strong>Match difficulty to your students</strong> — Hard for a
          university exam, Easy for a quick class recap. Support / Core /
          Extension tiers mirror UK-style scheme-of-work grading.
        </DocLi>
        <DocLi>
          <strong>Review big runs before assigning</strong> — a 100-question run
          lands in one set. Skim the hardest questions first and fix any weak
          answer keys before you assign it.
        </DocLi>
        <DocLi>
          <strong>Use coding type for technical courses</strong> — Gemini writes
          reasonable JavaScript function stubs with test cases.
        </DocLi>
        <DocLi>
          <strong>Maths notation is safe</strong> — Gemini is instructed to use
          plain Unicode symbols (× ÷ √ π ² ½) instead of LaTeX, so questions
          render correctly everywhere.
        </DocLi>
        <DocLi>
          <strong>Re-generate if quality is poor</strong> — run the same prompt
          again for a fresh set.
        </DocLi>
      </DocUl>
    </DocPage>
  );
}
