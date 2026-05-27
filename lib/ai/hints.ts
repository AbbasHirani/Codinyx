import { generateText } from "./gemini";

export type HintTier = 1 | 2 | 3 | 4;

export type MentorMode = "encouraging" | "neutral" | "strict";

interface HintContext {
  title: string;
  tags: string[];
  difficulty: string;
  constraints?: string | null;
  userCode?: string;
  weakTags?: string[];
  mentorMode: MentorMode;
}

const TONE_MAP: Record<MentorMode, string> = {
  encouraging: "Be warm, positive, and encouraging. Celebrate small wins.",
  neutral: "Be clear and concise. Stick to facts.",
  strict: "Be direct and demanding. Push the learner to think harder before helping.",
};

const GUARDRAIL =
  "CRITICAL: Do NOT provide any direct code, working solutions, or complete implementations. You are a tutor, not a solution generator.";

export async function getHint(tier: HintTier, ctx: HintContext): Promise<string> {
  const tone = TONE_MAP[ctx.mentorMode];
  const weakStr = ctx.weakTags?.length ? `Student weak areas: ${ctx.weakTags.join(", ")}.` : "";

  const systemBase = `${GUARDRAIL}\n${tone}\n${weakStr}`;
  const problemCtx = `Problem: "${ctx.title}" | Tags: ${ctx.tags.join(", ")} | Difficulty: ${ctx.difficulty}${ctx.constraints ? ` | Constraints: ${ctx.constraints}` : ""}`;
  const codeCtx = ctx.userCode ? `\n\nStudent's current code:\n\`\`\`\n${ctx.userCode}\n\`\`\`` : "";

  if (tier === 1) {
    return generateText(
      `${problemCtx}${codeCtx}\n\nGive ONE sentence that nudges the student toward the right thinking. No approach details, no data structures mentioned.`,
      `${systemBase}\nYou are giving a Tier 1 hint — a conceptual nudge only.`
    );
  }

  if (tier === 2) {
    return generateText(
      `${problemCtx}${codeCtx}\n\nSuggest a specific data structure or algorithm strategy in 2-3 bullet points. Give one concrete example input to try. No code.`,
      `${systemBase}\nYou are giving a Tier 2 hint — an approach suggestion.`
    );
  }

  if (tier === 3) {
    return generateText(
      `${problemCtx}${codeCtx}\n\nProvide a step-by-step algorithm outline in plain English only. No code syntax. Stop before the implementation level.`,
      `${systemBase}\nYou are giving a Tier 3 hint — a pseudocode-level outline.`
    );
  }

  // Tier 4: full solution (opt-in)
  return generateText(
    `${problemCtx}${codeCtx}\n\nThe student has requested a full explanation. Provide a clear, well-commented solution with a thorough explanation of why each step works.`,
    `You are an expert DSA tutor. The student explicitly opted in to see the full solution.`
  );
}

export function containsSolution(text: string): boolean {
  const solutionPatterns = [
    /def\s+\w+\s*\(/,
    /function\s+\w+\s*\(/,
    /return\s+\[.*\]/,
    /for\s+\w+\s+in\s+range/,
    /while\s*\(/,
  ];
  const matchCount = solutionPatterns.filter((p) => p.test(text)).length;
  return matchCount >= 2;
}
