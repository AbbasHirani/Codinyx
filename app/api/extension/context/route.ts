import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { prisma } from "@/lib/db/prisma";
import { parseProblemText } from "@/lib/problem/parser";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  code: z.string().default(""),
  language: z.string().default("python"),
  platform: z.string(),
  url: z.string().optional(),
  difficulty: z.string().optional(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = await getUser(req);
  if (!user || user._debugError) {
    return NextResponse.json({ 
      error: "Unauthorized", 
      debug: { 
        authHeader: !!authHeader, 
        secretHasLength: !!process.env.NEXTAUTH_SECRET,
        jwtError: user?._debugError 
      }
    }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400, headers: corsHeaders });

  const { title, description, code, language, platform, url, difficulty } = parsed.data;

  // Check if this problem already exists (by title + platform match)
  let problem = await prisma.problem.findFirst({
    where: { title, sourceUrl: url ?? undefined },
  });

  if (!problem) {
    try {
      const meta = await parseProblemText(description);
      problem = await prisma.problem.create({
        data: {
          title: meta.title || title,
          description,
          difficulty: meta.difficulty || difficulty || "Medium",
          tags: meta.tags,
          constraints: meta.constraints,
          sampleIO: meta.sampleIO,
          sourceUrl: url ?? null,
        },
      });
    } catch {
      // If AI parsing fails, create with basic data
      problem = await prisma.problem.create({
        data: {
          title,
          description,
          difficulty: difficulty || "Medium",
          tags: [platform],
          constraints: null,
          sampleIO: [],
          sourceUrl: url ?? null,
        },
      });
    }
  }

  // Find or create in-progress attempt
  let attempt = await prisma.attempt.findFirst({
    where: { userId: user.id, problemId: problem.id, status: "in-progress" },
    orderBy: { createdAt: "desc" },
  });

  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        code,
        language,
        status: "in-progress",
      },
    });
  } else if (code) {
    // Update code if provided
    attempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: { code, language },
    });
  }

  return NextResponse.json({
    problemId: problem.id,
    attemptId: attempt.id,
    problem,
  }, { headers: corsHeaders });
}
