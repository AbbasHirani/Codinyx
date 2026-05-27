import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { runTests } from "@/lib/judge0/client";
import { diagnoseCode } from "@/lib/ai/debug";
import { z } from "zod";

const schema = z.object({
  problemId: z.string(),
  code: z.string(),
  language: z.string(),
  attemptId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { problemId, code, language, attemptId } = parsed.data;

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const sampleIO = problem.sampleIO as { input: string; output: string }[];

  let testResults;
  try {
    testResults = await runTests(code, language, sampleIO.map((s) => ({ input: s.input, expected: s.output })));
  } catch {
    return NextResponse.json({ error: "Code execution failed" }, { status: 500 });
  }

  const allPassed = testResults.every((r) => r.passed);

  if (allPassed) {
    if (attemptId) {
      await prisma.attempt.update({
        where: { id: attemptId },
        data: { status: "solved", code },
      });
    }
    return NextResponse.json({ allPassed: true, results: testResults });
  }

  const failing = testResults.filter((r) => !r.passed);
  const diagnosis = await diagnoseCode(code, language, failing);

  return NextResponse.json({ allPassed: false, results: testResults, diagnosis });
}
