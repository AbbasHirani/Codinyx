import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;
  const { q, tag } = await searchParams;

  const entries = await prisma.notebookEntry.findMany({
    where: {
      userId,
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
    include: {
      problem: { select: { title: true, difficulty: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const DIFFICULTY_COLORS: Record<string, string> = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
          Second Brain
        </h1>
        <p className="text-[var(--muted)] text-sm mt-0.5">
          Your personal knowledge base of solved problems
        </p>
      </div>

      {/* Search */}
      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </form>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <BookOpen className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--muted)]">
            {q || tag ? "No notes match your search." : "Solve problems to build your notebook."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/notebook/${entry.id}`}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/50 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{entry.problem.title}</p>
                <span className={`text-xs font-medium flex-shrink-0 ${DIFFICULTY_COLORS[entry.problem.difficulty]}`}>
                  {entry.problem.difficulty}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] line-clamp-2">{entry.summary}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-[var(--accent)]">{entry.complexity}</p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(entry.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)]">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
