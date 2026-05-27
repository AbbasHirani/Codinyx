import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Code } from "lucide-react";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const entry = await prisma.notebookEntry.findUnique({
    where: { id },
    include: { problem: true },
  });

  if (!entry || entry.userId !== session!.user!.id) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/notebook" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold">{entry.problem.title}</h1>
        <span className="ml-auto text-xs text-[var(--muted)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(entry.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Tags and complexity */}
        <div className="flex flex-wrap gap-2 items-center">
          {entry.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)]">{t}</span>
          ))}
          <span className="ml-auto text-xs font-mono text-[var(--accent)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--card-border)]">
            {entry.complexity}
          </span>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Core Idea</h2>
          <p className="text-sm leading-relaxed">{entry.summary}</p>
        </div>

        {/* Approach */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Algorithm Approach</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{entry.approach}</p>
        </div>

        {/* Code */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--card-border)]">
            <Code className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-semibold text-[var(--muted)]">Solution Code</span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto text-[var(--foreground)] leading-relaxed">
            {entry.codeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
