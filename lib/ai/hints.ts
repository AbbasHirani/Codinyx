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
  previousHints?: { tier: HintTier; text: string }[];
}

const TONE_MAP: Record<MentorMode, string> = {
  encouraging: "Be warm and encouraging — acknowledge what they've got right, then nudge forward.",
  neutral: "Be natural and direct — like a colleague helping out, not a textbook.",
  strict: "Be blunt and push them to think harder. Still friendly, but don't hand things to them.",
};

const GUARDRAIL =
  "NEVER provide working code, complete implementations, or just rewrite their code for them. You are a mentor, not a code generator. Talk to them like a real person.";

export async function getHint(tier: HintTier, ctx: HintContext): Promise<string> {
  const tone = TONE_MAP[ctx.mentorMode];
  const weakStr = ctx.weakTags?.length
    ? `They tend to struggle with: ${ctx.weakTags.join(", ")}.`
    : "";

  const system = `You are a senior developer mentoring a student on DSA problems. Sound like a real person — conversational, specific, direct. Use "you", "your code", "try this". ${tone} ${weakStr} ${GUARDRAIL}`;

  const problemCtx = `Problem: "${ctx.title}" (${ctx.difficulty}) — Tags: ${ctx.tags.join(", ")}${ctx.constraints ? `. Constraints: ${ctx.constraints}` : ""}`;
  const codeSnippet = ctx.userCode
    ? `\n\nHere's what they have so far:\n\`\`\`\n${ctx.userCode}\n\`\`\``
    : "";
  const prevBlock =
    ctx.previousHints && ctx.previousHints.length > 0
      ? `\n\nHints already given to this student (DO NOT repeat these — build on them):\n${ctx.previousHints.map((h) => `- Tier ${h.tier}: "${h.text}"`).join("\n")}`
      : "";

  if (tier === 1) {
    return generateText(
      `${problemCtx}${codeSnippet}${prevBlock}

Give them ONE short nudge — 1-2 sentences max. Don't name the algorithm or data structure. Just ask them a question or point out what to think about. Sound like you're sitting next to them.`,
      system
    );
  }

  if (tier === 2) {
    return generateText(
      `${problemCtx}${codeSnippet}${prevBlock}

They're still stuck. Give them a direction — name the general technique or data structure and why it fits. Keep it to 3-4 sentences, specific to THIS problem. Give them one concrete thing to try next. No code.`,
      system
    );
  }

  if (tier === 3) {
    return generateText(
      `${problemCtx}${codeSnippet}${prevBlock}

Walk them through the algorithm step by step in plain English — like explaining on a whiteboard. Use numbered steps. Name specific variables, what to iterate, what to check. If they have code, point out exactly where their approach diverges. No code syntax.`,
      system
    );
  }

  // Tier 4: full walkthrough (student opted in)
  return generateText(
    `${problemCtx}${codeSnippet}

The student asked for the full walkthrough — they've been stuck and explicitly want to see the complete solution. Walk through the optimal solution clearly: explain the core idea, go through the algorithm step by step, then show and explain the code with comments on each important line. Be thorough and educational.`,
    `You are an expert DSA mentor. The student explicitly opted in for the full solution. Be thorough and clear.`
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
