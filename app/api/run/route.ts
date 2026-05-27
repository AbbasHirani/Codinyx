import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { runTests } from "@/lib/judge0/client";
import { z } from "zod";

const schema = z.object({
  code: z.string(),
  language: z.string(),
  tests: z.array(z.object({ input: z.string(), expected: z.string() })).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const results = await runTests(parsed.data.code, parsed.data.language, parsed.data.tests);
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
