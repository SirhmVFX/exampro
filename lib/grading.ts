// Auto-grading for submitted attempts. MCQ, true/false and short-answer
// questions grade instantly. Essay grades manually. Coding questions grade
// automatically when the language is JavaScript and test cases exist
// (executed in a sandboxed Web Worker); otherwise they go to manual grading.
import type {
  Assessment,
  PerQuestionResult,
  Question,
  TestCase,
} from "./types";

export interface GradeOutcome {
  perQuestion: PerQuestionResult[];
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  needsManualGrading: boolean;
}

/**
 * Runs student JavaScript against test cases inside a Web Worker so the code
 * cannot touch the page. Each test calls the student's `solve` function (or
 * the last defined function) with the parsed input.
 */
export function runJsTestCases(
  code: string,
  testCases: TestCase[],
  timeoutMs = 4000
): Promise<{ passed: number; total: number; details: string[] }> {
  return new Promise((resolve) => {
    const workerSrc = `
      self.onmessage = function (e) {
        const { code, testCases } = e.data;
        const details = [];
        let passed = 0;
        for (const tc of testCases) {
          try {
            const fn = new Function(
              "input",
              code + "\\n;var __args; try { __args = JSON.parse(input); } catch (_) { __args = input; }" +
              "\\nif (typeof solve === 'function') { return Array.isArray(__args) ? solve.apply(null, __args) : solve(__args); }" +
              "\\nthrow new Error('Define a function named solve(...)');"
            );
            const result = fn(tc.input);
            const actual = typeof result === "string" ? result : JSON.stringify(result);
            const expected = tc.expectedOutput.trim();
            const ok = actual !== undefined && actual !== null &&
              String(actual).trim() === expected;
            if (ok) { passed++; details.push("PASS"); }
            else details.push("FAIL — expected " + expected + ", got " + String(actual));
          } catch (err) {
            details.push("ERROR — " + (err && err.message ? err.message : String(err)));
          }
        }
        self.postMessage({ passed, total: testCases.length, details });
      };
    `;
    const blob = new Blob([workerSrc], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        passed: 0,
        total: testCases.length,
        details: ["TIMEOUT — code took too long (possible infinite loop)"],
      });
    }, timeoutMs);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ passed: 0, total: testCases.length, details: ["Worker error"] });
    };
    worker.postMessage({ code, testCases });
  });
}

async function gradeQuestion(
  q: Question,
  answer: unknown
): Promise<PerQuestionResult> {
  const base: PerQuestionResult = {
    questionId: q.id,
    answer: answer ?? null,
    correct: false,
    pointsAwarded: 0,
    maxPoints: q.points,
  };

  switch (q.type) {
    case "mcq": {
      const correct = typeof answer === "number" && answer === q.correctIndex;
      return { ...base, correct, pointsAwarded: correct ? q.points : 0 };
    }
    case "truefalse": {
      const correct = typeof answer === "boolean" && answer === q.correctBool;
      return { ...base, correct, pointsAwarded: correct ? q.points : 0 };
    }
    case "short": {
      const given = String(answer ?? "").trim().toLowerCase();
      const correct =
        given.length > 0 &&
        (q.acceptedAnswers ?? []).some(
          (a) => a.trim().toLowerCase() === given
        );
      return { ...base, correct, pointsAwarded: correct ? q.points : 0 };
    }
    case "essay":
    case "project":
      return { ...base, correct: null };
    case "coding": {
      const code = String(answer ?? "");
      if (
        q.language === "javascript" &&
        q.testCases &&
        q.testCases.length > 0 &&
        typeof Worker !== "undefined"
      ) {
        const result = await runJsTestCases(code, q.testCases);
        const ratio = result.total > 0 ? result.passed / result.total : 0;
        const pts = Math.round(q.points * ratio * 100) / 100;
        return {
          ...base,
          correct: ratio === 1,
          pointsAwarded: pts,
        };
      }
      // Other languages / no test cases → manual grading
      return { ...base, correct: null };
    }
  }
}

export async function gradeAttempt(
  assessment: Assessment,
  answers: Record<string, unknown>
): Promise<GradeOutcome> {
  const perQuestion: PerQuestionResult[] = [];
  for (const q of assessment.questions) {
    perQuestion.push(await gradeQuestion(q, answers[q.id]));
  }
  const maxScore = assessment.questions.reduce((s, q) => s + q.points, 0);
  const score = perQuestion.reduce((s, r) => s + r.pointsAwarded, 0);
  const needsManualGrading = perQuestion.some((r) => r.correct === null);
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return {
    perQuestion,
    score,
    maxScore,
    percent,
    passed: percent >= assessment.passPercent,
    needsManualGrading,
  };
}
