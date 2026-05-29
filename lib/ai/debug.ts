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
  const hasTests = failingTests.length > 0;

  const system = `You are a senior developer doing a code review for a student you're mentoring. Talk to them like a real person — like you're sitting next to them at a computer.

Rules:
- Use "you", "your code", "I can see you...", "the thing is..." — talk TO them
- Be specific: reference actual line numbers, actual variable names, actual values from their code
- Be honest: if the code is basically correct, say so clearly and explain what edge case or subtle issue exists
- Never be vague. Not "handle edge cases" — say "what happens if nums has only one element?"
- Don't be corporate or formal. Sound like a helpful colleague, not a textbook
- Never write code for them — describe what to change in plain English
- Return ONLY a valid JSON object, no markdown, no extra text`;

  const testSection = hasTests
    ? `These test cases failed:\n${failingTests
        .slice(0, 3)
        .map(
          (t) =>
            `  • Input: ${t.input} → expected ${t.expected}, got ${t.got}${t.stderr ? ` (stderr: ${t.stderr})` : ""}`
        )
        .join("\n")}`
    : "No test results available — review the code based on what you can see.";

  const prompt = `Language: ${language}

Code:
\`\`\`
${code}
\`\`\`

${testSection}

Give your code review as a JSON object with these four keys. Write each value in a natural, conversational tone — like you're talking to the student directly.

"rootCause": What's the actual situation? 2-3 sentences. If there's a real bug, name it clearly and explain why it breaks. If the code is mostly correct but has a gap or subtle issue, be honest about that too. Reference their actual code.

"linesHint": Which exact lines they should look at. Be casual and specific — like "Line 7, your if-condition" or "Lines 4-6, the inner loop" not vague descriptions.

"suggestedChange": What should they actually do next? Give one concrete actionable step as if you're pair-programming with them. No code — just clear direction.

"nextTest": One specific test case they should try right now. Give real values — like "try [3, 3] with target 6" or "what about an empty array?" not abstract descriptions.`;

  return generateJSON<DebugDiagnosis>(prompt, system);
}

export async function explainProblem(
  title: string,
  description: string,
  tags: string[],
  level: "partial" | "none" = "none"
): Promise<string> {
  if (level === "partial") {
    return generateText(
      `Problem: "${title}"
Tags: ${tags.join(", ")}

Description:
${description}

The student has read this problem and says they KIND OF understand it but are unsure about something.

Write a SHORT, focused clarification in plain text (no markdown, no code). Use blank lines between paragraphs. Structure:

WHAT IT'S REALLY ASKING
Re-state the core goal in one simple sentence — cut through any confusing wording.

THE KEY INSIGHT
Name the one trick or observation that makes this solvable. Why does the problem have a smarter solution than brute force?

COMMON CONFUSION
What do most people misread or get wrong the first time? Call it out directly.

APPROACHES TO CONSIDER
Name 1-2 high-level strategies (one sentence each, no code).

Be sharp and direct. Skip fluff. Maximum 200 words.`,
      "You are a DSA tutor giving a focused clarification to a student who partially understands a problem. Plain text only, no markdown, no code."
    );
  }

  return generateText(
    `Problem: "${title}"
Tags: ${tags.join(", ")}

Description:
${description}

The student says they do NOT understand this problem at all. Explain it from scratch.

Write a thorough explanation in plain text (no markdown, no code). Use blank lines between sections and ALLCAPS section titles. Structure:

WHAT IS THIS ASKING?
Explain in plain English as if the student has never seen this type of problem. Use a real-world analogy if helpful.

UNDERSTAND THE INPUT AND OUTPUT
What does the function receive? What must it return? Be very concrete using the first example from the description.

WALK THROUGH EXAMPLE 1 STEP BY STEP
Take the first example input and show how you'd arrive at the correct answer manually. Think out loud.

THE KEY INSIGHT
What is the core observation that makes this problem tractable? What would the naive approach miss?

TWO APPROACHES
Approach 1 — [name]: one paragraph, plain English only.
Approach 2 — [name]: one paragraph, plain English only.

WATCH OUT FOR
List 2-3 edge cases or traps as short bullet points (use dashes).

Be thorough and clear. Maximum 400 words.`,
    "You are a DSA tutor explaining a coding problem from scratch to a confused student. Plain text only, no markdown, no code. Use ALLCAPS section titles."
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
