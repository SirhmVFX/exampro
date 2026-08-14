import { NextRequest, NextResponse } from "next/server";

// Generates assessment questions with Google Gemini (free API tier).
// Env: GEMINI_API_KEY — https://aistudio.google.com/apikey

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

interface GenerateBody {
  subject: string;
  className: string;
  topic?: string;
  count: number;
  type: "mcq" | "truefalse" | "short" | "essay" | "coding";
  difficulty: "easy" | "medium" | "hard";
  language?: string; // for coding questions
}

function buildPrompt(b: GenerateBody): string {
  const base = `You are an expert educator creating assessment questions.
Generate exactly ${b.count} ${b.difficulty} difficulty questions for the subject "${b.subject}" aimed at "${b.className}" students${b.topic ? ` on the topic "${b.topic}"` : ""}.

Return ONLY a JSON array. No markdown, no commentary.`;

  switch (b.type) {
    case "mcq":
      return `${base}
Each item: {"text": string, "options": [4 strings], "correctIndex": 0-3, "explanation": string, "points": number (1-5)}`;
    case "truefalse":
      return `${base}
Each item: {"text": string (a statement), "correctBool": boolean, "explanation": string, "points": number (1-3)}`;
    case "short":
      return `${base}
Each item: {"text": string, "acceptedAnswers": [1-4 short strings, exact expected answers], "explanation": string, "points": number (1-5)}`;
    case "essay":
      return `${base}
Each item: {"text": string (an open-ended essay prompt), "explanation": string (a model answer outline for the grader), "points": number (5-20)}`;
    case "coding":
      return `${base}
These are coding challenges in ${b.language ?? "javascript"}.
Each item: {"text": string (problem statement; the student must define a function named solve), "starterCode": string (e.g. "function solve(input) {\\n  // your code\\n}"), "testCases": [{"input": string (JSON-encoded arguments array), "expectedOutput": string}] (3-5 cases), "explanation": string, "points": number (5-15)}`;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.subject || !body.count || !body.type) {
    return NextResponse.json(
      { error: "subject, count and type are required" },
      { status: 400 }
    );
  }
  body.count = Math.min(Math.max(1, Number(body.count)), 20);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(body) }] }],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Gemini API error (${res.status}): ${err.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let questions: unknown;
    try {
      questions = JSON.parse(text);
    } catch {
      // Model occasionally wraps output in code fences despite instructions
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Could not parse model output");
      questions = JSON.parse(match[0]);
    }

    if (!Array.isArray(questions)) {
      throw new Error("Model did not return an array");
    }

    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Failed to generate questions",
      },
      { status: 500 }
    );
  }
}
