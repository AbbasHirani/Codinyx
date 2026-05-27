import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problem/ProblemWorkspace";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProblemPage({ params }: Props) {
  const session = await auth();
  const userId = session!.user!.id!;
  const { id } = await params;

  const problem = await prisma.problem.findUnique({ where: { id } });
  if (!problem) notFound();

  let attempt = await prisma.attempt.findFirst({
    where: { userId, problemId: id, status: "in-progress" },
    orderBy: { createdAt: "desc" },
  });

  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: { userId, problemId: id, code: "", language: "python", status: "in-progress" },
    });
  }

  return (
    <ProblemWorkspace
      problem={{
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags as string[],
        constraints: problem.constraints,
        sampleIO: problem.sampleIO as { input: string; output: string }[],
      }}
      attempt={{ id: attempt.id, code: attempt.code, language: attempt.language }}
    />
  );
}
