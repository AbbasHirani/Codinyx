import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { prisma } from "@/lib/db/prisma";
import { runTests, type TestResult } from "@/lib/judge0/client";
import { diagnoseCode } from "@/lib/ai/debug";
import { computeSkillUpdate } from "@/lib/problem/parser";
import { z } from "zod";

const schema = z.object({
  problemId: z.string(),
  code: z.string(),
  language: z.string(),
  attemptId: z.string().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { problemId, code, language, attemptId } = parsed.data;

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });

  const sampleIO = (problem.sampleIO as { input: string; output: string }[]) ?? [];
  let testResults: TestResult[] = [];
  let ranTests = false;

  // Only run Judge0 if we have test cases
  if (sampleIO.length > 0) {
    try {
      testResults = await runTests(
        code,
        language,
        sampleIO.map((s) => ({ input: s.input, expected: s.output }))
      );
      ranTests = true;
    } catch {
      // Judge0 unavailable — fall through to AI-only analysis
    }
  }

  // If tests ran and all passed, mark solved + update skill profiles
  if (ranTests && testResults.every((r) => r.passed)) {
    if (attemptId) {
      const attempt = await prisma.attempt.update({
        where: { id: attemptId },
        data: { status: "solved", code },
      });

      // Update skill proficiency for each of this problem's tags
      const tags = (problem.tags as string[]) ?? [];
      if (tags.length > 0 && user) {
        const existing = await prisma.skillProfile.findMany({
          where: { userId: user.id, tag: { in: tags } },
        });
        const byTag = Object.fromEntries(existing.map((s) => [s.tag, s.proficiency]));

        await Promise.all(
          tags.map((tag) => {
            const current = byTag[tag] ?? 50;
            const updated = computeSkillUpdate(current, true, attempt.hintsUsed, problem.difficulty);
            return prisma.skillProfile.upsert({
              where: { userId_tag: { userId: user.id, tag } },
              update: { proficiency: updated },
              create: { userId: user.id, tag, proficiency: updated },
            });
          })
        );
      }
    }
    return NextResponse.json({ allPassed: true, results: testResults });
  }

  // AI diagnosis — uses test results if available, otherwise analyzes code alone
  const failing = testResults.filter((r) => !r.passed);
  const diagnosis = await diagnoseCode(code, language, failing);

  return NextResponse.json({ allPassed: false, results: testResults, diagnosis });
}
