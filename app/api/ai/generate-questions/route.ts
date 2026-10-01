import { NextRequest, NextResponse } from "next/server";
import { getInstitution } from "@/lib/db";
import { getPlan, planAllows } from "@/lib/plans";

// Generates assessment questions with Google Gemini — same engine and prompt
// structure as the bridgitus generator: up to 100 questions per run, batched
// to avoid token truncation, with worked solutions and math notation rules.
// Env: GEMINI_API_KEY — https://aistudio.google.com/apikey

// Default matches the proven-working model used by bridgitus-admin; override
// with GEMINI_MODEL in .env.local if your key targets a different model.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite";
const MAX_COUNT = 100;
const BATCH_SIZE = 15;

type GenType = "mcq" | "truefalse" | "short" | "essay" | "coding" | "mixed";

interface GenerateBody {
  institutionId: string;
  subject: string;
  className: string;
  topic?: string;
  skill?: string;
  count: number;
  type: GenType;
  difficulty: "easy" | "medium" | "hard" | "support" | "core" | "extension";
  format?: string; // "Mixed" | "Multiple Choice Only" etc.
  context?: string; // "Real-life" | "Abstract" | "Exam-style" | "Problem-solving"
  extraPrompt?: string; // free-form extra instructions
  language?: string;
}

function buildPrompt(b: GenerateBody, count: number): string {
  const diffLabel = b.difficulty ?? "medium";
  const typeNote =
    b.type === "mcq"
      ? 'All questions must be "mcq" with exactly 4 options.'
      : b.type === "truefalse"
        ? 'All questions must be "truefalse" (statements judged true or false).'
        : b.type === "short"
          ? 'All questions must be "short" (short exact answers).'
          : b.type === "essay"
            ? 'All questions must be "essay" (open-ended prompts with a marking guide).'
            : b.type === "coding"
              ? `All questions must be "coding" challenges in ${b.language ?? "javascript"}. The student defines a function named solve.`
              : "Mix question types: use a variety of mcq, truefalse and short.";

  const diffNote =
    diffLabel === "easy" || diffLabel === "support"
      ? "Use simple language, single-step problems and foundational concepts — suitable for students who need extra scaffolding."
      : diffLabel === "hard" || diffLabel === "extension"
        ? "Use complex multi-step problems, higher-order thinking and application to novel situations."
        : "Use level-appropriate standard difficulty — the typical expected level for this group.";

  const ctxNote =
    b.context === "Real-life"
      ? "Frame all questions in real-world, relatable scenarios."
      : b.context === "Exam-style"
        ? "Use formal exam-style wording and presentation."
        : b.context === "Problem-solving"
          ? "Focus on problem-solving and reasoning rather than recall."
          : b.context
            ? `Use a ${b.context.toLowerCase()} context.`
            : "";

  const extra = b.extraPrompt ? `\nCUSTOM INSTRUCTIONS: ${b.extraPrompt}` : "";

  const typeSchema =
    b.type === "mcq"
      ? `{"type":"mcq","text":string,"options":[4 strings],"correctIndex":0-3,"points":1-5}`
      : b.type === "truefalse"
        ? `{"type":"truefalse","text":string (a statement),"correctBool":boolean,"points":1-3}`
        : b.type === "short"
          ? `{"type":"short","text":string,"acceptedAnswers":[1-4 short exact answer strings],"points":1-5}`
          : b.type === "essay"
            ? `{"type":"essay","text":string (open prompt),"points":5-20}`
            : b.type === "coding"
              ? `{"type":"coding","text":string,"starterCode":string,"testCases":[{"input":string,"expectedOutput":string}] (3-5 cases),"points":5-15}`
              : `{"type":"mcq"|"truefalse"|"short", with the matching fields for that type}`;

  return `You are an expert ${b.subject} teacher creating a high-quality question set for students.

SUBJECT: ${b.subject}
GROUP/CLASS: ${b.className}
TOPIC: ${b.topic || "general coverage of the subject"}${b.skill ? `\nSKILL: ${b.skill}` : ""}
DIFFICULTY: ${diffLabel}
COUNT: exactly ${count} questions

QUESTION TYPE RULE: ${typeNote}
DIFFICULTY RULE: ${diffNote}${ctxNote ? `\nCONTEXT RULE: ${ctxNote}` : ""}${extra}

MATHEMATICS, SCIENCE & GEOMETRY NOTATION RULES — ALWAYS apply for relevant subjects:
- Use Unicode symbols directly: × ÷ ± √ π ∞ ≤ ≥ ≠ ∈ ∑ ∫ ⁰ ¹ ² ³ ⁴ ⁵ ½ ¼ ¾ ° → ∠ ∥ ⊥ △ ▲ ◯
- Write exponents as x² or x^2 (never x**2). Compound exponents: (x+1)^2
- Write fractions as ¾, 2/3 or (3x+1)/(x−2) — never ambiguous slashes.
- Square roots: √16, √(3x+1). Cube root: ∛8. Bracket compound radicands.
- Equations: use the proper minus sign − (not a hyphen). Example: 3x² − 7x + 2 = 0
- Geometry: describe shapes with full measurements. Example: "a right-angled triangle with legs 3 cm and 4 cm and hypotenuse 5 cm"
- Data tables: use pipe notation:
  | x | 1 | 2 | 3 | 4 |
  | y | 3 | 7 | 11 | 15 |

WORKED SOLUTIONS must:
- Show every step numbered (1. 2. 3. …)
- Use proper math symbols and notation
- Explain the reasoning at each step, not just the calculation
- For geometry, state the rules/theorems used (e.g. "By Pythagoras' theorem: a² + b² = c²")

CRITICAL: Return ONLY a valid JSON array. No markdown fences, no commentary, no text before or after.
Every element must include ALL these exact fields for its type:

[
  ${typeSchema},
  ...
]

STRICT RULES:
- mcq: exactly 4 options. correctIndex is the 0-based index of the correct option.
- truefalse: correctBool is true or false.
- short: acceptedAnswers lists 1-4 acceptable exact answers.
- essay: include a "workedSolution" with a model answer outline and an "explanation" marking guide for the grader.
- Every question also includes: "explanation" (1-2 sentences on why the answer is correct) and "workedSolution" (numbered steps).
- All ${count} questions must test DIFFERENT aspects of the topic — no repetition.
- Do NOT wrap the response in markdown code fences. Start with [ and end with ].

Return the JSON array now:`;
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 32768,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/** Strips markdown fences and repairs stray escapes so JSON.parse succeeds. */
function sanitizeJson(raw: string): string {
  const text = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const match = text.match(/\[[\s\S]*\]/);
  const body = match ? match[0] : text;
  return body.replace(/\\([^"\\/bfnrtu])/g, (_, char) => char);
}

function parseQuestions(text: string): Record<string, unknown>[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJson(text));
  } catch {
    const match = sanitizeJson(text).match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Could not parse model output");
    parsed = JSON.parse(match[0]);
  }
  if (!Array.isArray(parsed)) throw new Error("Model did not return an array");
  return parsed as Record<string, unknown>[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.subject || !body.count || !body.type || !body.institutionId) {
    return NextResponse.json(
      { error: "institutionId, subject, count and type are required" },
      { status: 400 },
    );
  }

  // ── Server-side quota enforcement ─────────────────────────────────────────
  const institution = await getInstitution(body.institutionId);
  if (!institution) {
    return NextResponse.json(
      { error: "Institution not found." },
      { status: 404 },
    );
  }
  const plan = getPlan(institution.plan);
  const allowed = planAllows(plan, { aiUsed: institution.aiGenerationsUsed });
  if (!allowed.ai) {
    return NextResponse.json(
      {
        error:
          plan.aiGenerationsPerMonth === -1
            ? "AI generation is not available on your current plan."
            : `You've used all ${plan.aiGenerationsPerMonth} AI generations this month. Upgrade to generate more.`,
      },
      { status: 403 },
    );
  }

  body.count = Math.min(Math.max(1, Number(body.count)), MAX_COUNT);

  try {
    // ── Batch large runs (same strategy as bridgitus: 15 per call) ──────────
    const questions: Record<string, unknown>[] = [];
    let remaining = body.count;
    let batchNum = 0;

    while (remaining > 0) {
      const batchCount = Math.min(BATCH_SIZE, remaining);
      const prompt = buildPrompt({ ...body, count: batchCount }, batchCount);
      const text = await callGemini(apiKey, prompt);
      const batch = parseQuestions(text);
      questions.push(...batch);
      remaining -= batchCount;
      batchNum++;

      // If a batch came back empty, bail instead of looping forever.
      if (batch.length === 0 && remaining > 0) {
        throw new Error(
          `Batch ${batchNum} did not return any questions. Please try again.`,
        );
      }
    }

    return NextResponse.json({
      questions,
      batches: batchNum,
      count: questions.length,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to generate questions",
      },
      { status: 500 },
    );
  }
}
