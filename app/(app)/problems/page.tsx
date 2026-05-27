import { prisma } from "@/lib/db/prisma";
import { ProblemImport } from "@/components/problem/ProblemImport";
import Link from "next/link";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
};

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Problems</h1>
        <p className="text-[var(--muted)] text-sm mt-0.5">
          Paste a problem description or URL to get started
        </p>
      </div>

      <ProblemImport />

      {problems.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border)]">
            <h2 className="text-sm font-semibold">Problem Library</h2>
          </div>
          <ul className="divide-y divide-[var(--card-border)]">
            {problems.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/problems/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {(p.tags as string[]).slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[p.difficulty] ?? ""}`}
                  >
                    {p.difficulty}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
