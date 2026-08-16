import type { Question, QuestionType } from "./types";
import { parseCsvMaps } from "./csv";

const TYPE_ALIASES: Record<string, QuestionType> = {
  mcq: "mcq",
  multiplechoice: "mcq",
  multiple: "mcq",
  choice: "mcq",
  truefalse: "truefalse",
  trueorfalse: "truefalse",
  tf: "truefalse",
  boolean: "truefalse",
  short: "short",
  shortanswer: "short",
  fillin: "short",
  essay: "essay",
  long: "essay",
  coding: "coding",
  code: "coding",
  project: "project",
};

function pick(map: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (map[k]) return map[k];
  }
  return "";
}

function parseType(raw: string, hasOptions: boolean): QuestionType {
  const key = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (TYPE_ALIASES[key]) return TYPE_ALIASES[key];
  return hasOptions ? "mcq" : "short";
}

function optionList(map: Record<string, string>): string[] {
  const named = ["optiona", "optionb", "optionc", "optiond", "optione", "optionf"]
    .map((k) => map[k] ?? "")
    .filter(Boolean);
  if (named.length) return named;
  const blob = pick(map, ["options", "choices"]);
  if (!blob) return [];
  return blob
    .split(/\||;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveCorrectIndex(options: string[], correct: string): number {
  const c = correct.trim();
  if (!c) return 0;
  const letter = c.toUpperCase();
  if (/^[A-F]$/.test(letter)) {
    const i = letter.charCodeAt(0) - 65;
    return i < options.length ? i : 0;
  }
  const n = Number(c);
  if (Number.isFinite(n) && String(n) === c) {
    if (n >= 1 && n <= options.length) return n - 1;
    if (n >= 0 && n < options.length) return n;
  }
  const idx = options.findIndex((o) => o.toLowerCase() === c.toLowerCase());
  return idx >= 0 ? idx : 0;
}

function parseBool(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  return ["true", "t", "yes", "y", "1"].includes(s);
}

export const QUESTION_CSV_HEADERS = [
  "type",
  "text",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct",
  "points",
  "explanation",
  "subject",
  "class",
  "topic",
  "skill",
] as const;

export function questionCsvTemplate(): string {
  return [
    QUESTION_CSV_HEADERS.join(","),
    'mcq,"What is 2 + 2?",3,4,5,6,B,1,"2 + 2 = 4",Mathematics,JSS 1,Arithmetic,',
    "truefalse,The sun is a star,,,,,true,1,,Science,JSS 1,Space,",
    'short,"Capital of Nigeria?",,,,,Abuja,1,"Abuja is the capital",Civic,JSS 1,,',
    'essay,"Explain photosynthesis in your own words.",,,,, ,5,,Biology,SS 1,Plants,',
  ].join("\n");
}

export function parseQuestionCsv(
  text: string,
  meta: {
    institutionId: string;
    teacherId: string;
    newId: () => string;
    defaults?: { subject?: string; className?: string };
  }
): { questions: Question[]; errors: string[] } {
  const maps = parseCsvMaps(text);
  const errors: string[] = [];
  const questions: Question[] = [];
  if (!maps.length) {
    return {
      questions: [],
      errors: ["CSV needs a header row and at least one question."],
    };
  }

  maps.forEach((map, i) => {
    const row = i + 2;
    const textVal = pick(map, ["text", "question", "prompt", "stem"]);
    if (!textVal) {
      errors.push(`Row ${row}: missing question text.`);
      return;
    }
    const options = optionList(map);
    const type = parseType(pick(map, ["type", "questiontype"]), options.length >= 2);
    const subject =
      pick(map, ["subject", "course"]) || meta.defaults?.subject || "";
    const className =
      pick(map, ["class", "classname", "cohort", "grade", "level"]) ||
      meta.defaults?.className ||
      "";
    if (!subject) {
      errors.push(`Row ${row}: missing subject (set a default or a subject column).`);
      return;
    }
    if (!className) {
      errors.push(`Row ${row}: missing class (set a default or a class column).`);
      return;
    }
    const correct = pick(map, ["correct", "answer", "correctanswer", "key"]);
    const q: Question = {
      id: meta.newId(),
      institutionId: meta.institutionId,
      teacherId: meta.teacherId,
      subject,
      className,
      topic: pick(map, ["topic"]) || undefined,
      skill: pick(map, ["skill"]) || undefined,
      type,
      text: textVal,
      points: Math.max(1, Number(pick(map, ["points", "mark", "marks"])) || 1),
      explanation: pick(map, ["explanation", "rationale", "feedback"]) || undefined,
      createdAt: Date.now(),
    };
    if (type === "mcq") {
      if (options.length < 2) {
        errors.push(`Row ${row}: MCQ needs at least two options (option_a, option_b, …).`);
        return;
      }
      q.options = options;
      q.correctIndex = resolveCorrectIndex(options, correct);
    } else if (type === "truefalse") {
      q.correctBool = parseBool(correct || pick(map, ["optiona"]));
    } else if (type === "short") {
      const answers = (correct || pick(map, ["optiona", "accepted", "acceptedanswers"]))
        .split(/[|,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      q.acceptedAnswers = answers;
    }
    questions.push(q);
  });

  return { questions, errors };
}
