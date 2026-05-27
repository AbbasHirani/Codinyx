import { generateJSON } from "@/lib/ai/gemini";

export interface ParsedProblem {
  title: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  constraints: string;
  sampleIO: { input: string; output: string }[];
  description: string;
}

export async function parseProblemText(text: string): Promise<ParsedProblem> {
  const system = `You are a DSA problem parser. Extract metadata from the problem text.
Return ONLY a JSON object with these exact keys:
- title: problem name
- tags: array of topic tags from: ["arrays", "strings", "hashmaps", "two-pointers", "sliding-window", "binary-search", "recursion", "dynamic-programming", "trees", "graphs", "linked-lists", "stacks", "queues", "heaps", "greedy", "backtracking", "math"]
- difficulty: exactly one of "Easy", "Medium", "Hard"
- constraints: string summarizing key constraints (e.g. "1 <= n <= 10^5, values can be negative")
- sampleIO: array of {input, output} pairs from the examples
- description: cleaned problem description preserving all important details`;

  const result = await generateJSON<ParsedProblem>(
    `Parse this problem:\n\n${text}`,
    system
  );
  return result;
}

export function computeSkillUpdate(
  currentProficiency: number,
  solved: boolean,
  hintsUsed: number,
  difficulty: string
): number {
  const difficultyMultiplier = { Easy: 1, Medium: 1.5, Hard: 2 }[difficulty] ?? 1;
  const hintPenalty = Math.min(hintsUsed * 3, 15);
  const base = solved ? 10 * difficultyMultiplier - hintPenalty : -2;
  const decayedCurrent = currentProficiency * 0.95;
  return Math.max(0, Math.min(100, decayedCurrent + base));
}
