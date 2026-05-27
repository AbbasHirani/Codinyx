import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getHint, containsSolution, type HintTier, type MentorMode } from "@/lib/ai/hints";
import { z } from "zod";

const schema = z.object({
  problemId: z.string(),
  tier: z.number().int().min(1).max(4),
  userCode: z.string().optional(),
  attemptId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { problemId, tier, userCode, attemptId } = parsed.data;
  const userId = session.user.id!;

  const [problem, user, weakSkills] = await Promise.all([
    prisma.problem.findUnique({ where: { id: problemId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { mentorMode: true } }),
    prisma.skillProfile.findMany({
      where: { userId, proficiency: { lt: 40 } },
      select: { tag: true },
    }),
  ]);

  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const hint = await getHint(tier as HintTier, {
    title: problem.title,
    tags: problem.tags as string[],
    difficulty: problem.difficulty,
    constraints: problem.constraints,
    userCode,
    weakTags: weakSkills.map((s) => s.tag),
    mentorMode: (user?.mentorMode ?? "neutral") as MentorMode,
  });

  if (tier < 4 && containsSolution(hint)) {
    return NextResponse.json(
      { hint: "I detected my response may contain too much detail. Try thinking about the approach first — what data structure could reduce the time complexity?" },
      { status: 200 }
    );
  }

  if (attemptId) {
    await Promise.all([
      prisma.hintLog.create({ data: { attemptId, tier, hintText: hint } }),
      prisma.attempt.update({
        where: { id: attemptId },
        data: { hintsUsed: { increment: 1 }, maxTier: { set: Math.max(tier) } },
      }),
    ]);
  }

  return NextResponse.json({ hint });
}
