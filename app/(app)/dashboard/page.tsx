import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WeaknessHeatmap } from "@/components/dashboard/WeaknessHeatmap";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [attempts, skillProfile, recentAttempts] = await Promise.all([
    prisma.attempt.count({ where: { userId } }),
    prisma.skillProfile.findMany({ where: { userId } }),
    prisma.attempt.findMany({
      where: { userId },
      include: { problem: { select: { title: true, tags: true, difficulty: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const solved = await prisma.attempt.count({ where: { userId, status: "solved" } });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted)] text-sm mt-0.5">
            Welcome back, {session!.user!.name?.split(" ")[0]}
          </p>
        </div>
        <Link
          href="/problems"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Problem
        </Link>
      </div>

      <StatsCards total={attempts} solved={solved} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeaknessHeatmap skillProfile={skillProfile} />

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">
            Recent Activity
          </h2>
          {recentAttempts.length === 0 ? (
            <p className="text-sm text-[var(--muted)] text-center py-8">
              No problems attempted yet.{" "}
              <Link href="/problems" className="text-[var(--accent)] hover:underline">
                Start one!
              </Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {recentAttempts.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/problems/${a.problemId}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.problem.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {a.problem.tags.slice(0, 2).join(", ")}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.status === "solved"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
