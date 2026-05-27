import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { parseProblemText } from "@/lib/problem/parser";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(20),
  url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const meta = await parseProblemText(parsed.data.text);
    const problem = await prisma.problem.create({
      data: {
        title: meta.title,
        description: parsed.data.text,
        difficulty: meta.difficulty,
        tags: meta.tags,
        constraints: meta.constraints,
        sampleIO: meta.sampleIO,
        sourceUrl: parsed.data.url ?? null,
      },
    });
    return NextResponse.json({ problemId: problem.id, problem }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to parse problem" }, { status: 500 });
  }
}
