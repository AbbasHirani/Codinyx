import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await params;
  if (session.user.id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [skillProfile, attempts] = await Promise.all([
    prisma.skillProfile.findMany({ where: { userId } }),
    prisma.attempt.findMany({
      where: { userId },
      include: { problem: { select: { tags: true, difficulty: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const solved = attempts.filter((a) => a.status === "solved").length;
  const avgHints =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.hintsUsed, 0) / attempts.length)
      : 0;

  return NextResponse.json({
    skillProfile,
    stats: { total: attempts.length, solved, avgHints },
  });
}
