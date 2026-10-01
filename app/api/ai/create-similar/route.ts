import { NextRequest, NextResponse } from "next/server";

// Generates 3 similar questions to a given question using Gemini.
// Used by the "Practice similar" button on student result pages.
// Env: GEMINI_API_KEY

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  let body: { question: Record<string, unknown>; count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { question, count = 3 } = body;
  if (!question || !question.text) {
    return NextResponse.json({ error: "question.text is required" }, { status: 400 });
  }

  const qType = String(question.type ?? "mcq");
  const typeMap: Record<string, string> = {
    mcq: "multiple choice",
    truefalse: "true/false",
    short: "short answer",
    essay: "essay",
    coding: "coding",
    project: "project",
  };
  const typeLabel = typeMap[qType] ?? qType;
  const subject = question.subject ? `Subject: ${question.subject}.` : "";
  const topic = question.topic ? `Topic: ${question.topic}.` : "";

  const prompt = `You are an expert educator. A student got this ${typeLabel} question wrong and needs practice.

Original question: ${question.text}
${subject} ${topic}

Generate exactly ${count} similar practice questions at the same difficulty level and format.
Make them different questions but testing the same concept.

Return ONLY a JSON array. No markdown. Include "workedSolution" (step-by-step working) on each.

${qType === "mcq" ? `Each item: {"id": unique_string, "type": "mcq", "text": string, "options": [4 strings], "correctIndex": 0-3, "explanation": string, "workedSolution": string, "points": ${question.points ?? 1}}` : ""}
${qType === "truefalse" ? `Each item: {"id": unique_string, "type": "truefalse", "text": string, "correctBool": boolean, "explanation": string, "workedSolution": string, "points": ${question.points ?? 1}}` : ""}
${qType === "short" ? `Each item: {"id": unique_string, "type": "short", "text": string, "acceptedAnswers": [1-3 strings], "explanation": string, "workedSolution": string, "points": ${question.points ?? 1}}` : ""}
${qType === "essay" ? `Each item: {"id": unique_string, "type": "essay", "text": string, "explanation": string, "workedSolution": string, "points": ${question.points ?? 5}}` : ""}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Gemini error: ${err.slice(0, 200)}` }, { status: 502 });
    }

    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let questions: unknown;
    try {
      questions = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Could not parse response");
      questions = JSON.parse(match[0]);
    }

    if (!Array.isArray(questions)) throw new Error("Model did not return an array");

    // Ensure each question has a unique id
    const withIds = (questions as Record<string, unknown>[]).map((q, i) => ({
      ...q,
      id: q.id ?? `sim-${Date.now()}-${i}`,
      institutionId: question.institutionId ?? "",
      teacherId: question.teacherId ?? "",
      subject: question.subject ?? "",
      className: question.className ?? "",
      topic: question.topic,
      createdAt: Date.now(),
    }));

    return NextResponse.json({ questions: withIds });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate similar questions" },
      { status: 500 }
    );
  }
}
