import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { generateNotebookEntry } from "@/lib/ai/debug";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const entries = await prisma.notebookEntry.findMany({
    where: {
      userId: session.user.id,
      ...(tag ? { tags: { has: tag } } : {}),
      ...(q
        ? {
            OR: [
              { summary: { contains: q, mode: "insensitive" } },
              { approach: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { problem: { select: { title: true, difficulty: true, tags: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(entries);
}

const generateSchema = z.object({
  problemId: z.string(),
  code: z.string(),
  language: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { problemId, code, language } = parsed.data;
  const userId = session.user.id!;

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const existing = await prisma.notebookEntry.findFirst({
    where: { userId, problemId },
  });

  const generated = await generateNotebookEntry(
    problem.title,
    problem.tags as string[],
    code,
    language
  );

  if (existing) {
    const updated = await prisma.notebookEntry.update({
      where: { id: existing.id },
      data: { ...generated, codeSnippet: code, tags: problem.tags as string[] },
    });
    return NextResponse.json(updated);
  }

  const entry = await prisma.notebookEntry.create({
    data: {
      userId,
      problemId,
      ...generated,
      codeSnippet: code,
      tags: problem.tags as string[],
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
