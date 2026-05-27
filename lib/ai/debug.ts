import { generateJSON, generateText } from "./gemini";

export interface DebugDiagnosis {
  rootCause: string;
  linesHint: string;
  suggestedChange: string;
  nextTest: string;
}

export interface FailingTest {
  input: string;
  expected: string;
  got: string;
  stderr?: string;
}

export async function diagnoseCode(
  code: string,
  language: string,
  failingTests: FailingTest[]
): Promise<DebugDiagnosis> {
  const testSummary = failingTests
    .slice(0, 3)
    .map((t) => `  Input: ${t.input} → Expected: ${t.expected}, Got: ${t.got}${t.stderr ? ` | stderr: ${t.stderr}` : ""}`)
    .join("\n");

  const system = `You are a debugging assistant for a coding education platform.
Analyze the code and failing tests. Return ONLY a JSON object (no markdown) with these exact keys:
- rootCause: 1-2 sentence description of the underlying bug
- linesHint: which lines or blocks contain the probable bug (e.g. "lines 4-7" or "the inner loop condition")
- suggestedChange: a specific, incremental change to try — described in words, NOT as code
- nextTest: a specific test input the student should try to verify their fix

Do NOT include any working solution code. Be educational, not prescriptive.`;

  const prompt = `Language: ${language}

Code:
\`\`\`
${code}
\`\`\`

Failing tests:
${testSummary}`;

  return generateJSON<DebugDiagnosis>(prompt, system);
}

export async function explainProblem(
  title: string,
  description: string,
  tags: string[]
): Promise<string> {
  return generateText(
    `Problem: "${title}" | Tags: ${tags.join(", ")}\n\nDescription:\n${description}\n\nProvide a concise explanation covering: (1) what the problem is really asking, (2) key constraints to watch, (3) common edge cases, (4) 1-2 high-level approaches without code.`,
    "You are a DSA tutor explaining a coding problem to a student. Be clear and educational. No code examples."
  );
}

export async function generateNotebookEntry(
  title: string,
  tags: string[],
  code: string,
  language: string
): Promise<{ summary: string; approach: string; complexity: string }> {
  return generateJSON(
    `Problem: "${title}" | Tags: ${tags.join(", ")}\n\nAccepted solution (${language}):\n\`\`\`\n${code}\n\`\`\``,
    `You are generating a structured notebook entry for a solved coding problem.
Return JSON with:
- summary: 1-2 sentence description of the core idea
- approach: 3-5 sentences explaining the algorithm and why it works
- complexity: time and space complexity (e.g. "O(n) time, O(n) space")`
  );
}
