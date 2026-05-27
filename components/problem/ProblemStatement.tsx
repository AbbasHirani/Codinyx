const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-green-400 bg-green-400/10 border-green-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

interface Problem {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  constraints?: string | null;
  sampleIO: { input: string; output: string }[];
}

export function ProblemStatement({ problem }: { problem: Problem }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">{problem.title}</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLORS[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            {problem.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
        {problem.description}
      </div>

      {/* Constraints */}
      {problem.constraints && (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5">Constraints</p>
          <p className="text-sm font-mono text-[var(--muted)] bg-[var(--background)] rounded-lg px-3 py-2">
            {problem.constraints}
          </p>
        </div>
      )}

      {/* Examples */}
      {problem.sampleIO.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">Examples</p>
          <div className="space-y-2">
            {problem.sampleIO.map((ex, i) => (
              <div key={i} className="rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-3 text-xs font-mono">
                <div>
                  <span className="text-[var(--muted)]">Input: </span>
                  <span>{ex.input}</span>
                </div>
                <div className="mt-1">
                  <span className="text-[var(--muted)]">Output: </span>
                  <span className="text-green-400">{ex.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
