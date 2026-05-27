import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(problem);
}
