import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { prisma } from "@/lib/db/prisma";
import { explainProblem } from "@/lib/ai/debug";
import { z } from "zod";

const schema = z.object({
  problemId: z.string(),
  level: z.enum(["partial", "none"]).default("none"),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const problem = await prisma.problem.findUnique({ where: { id: parsed.data.problemId } });
  if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const explanation = await explainProblem(
    problem.title,
    problem.description,
    problem.tags as string[],
    parsed.data.level
  );

  return NextResponse.json({ explanation });
}
