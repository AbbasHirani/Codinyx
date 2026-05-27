interface StatsCardsProps {
  total: number;
  solved: number;
}

export function StatsCards({ total, solved }: StatsCardsProps) {
  const rate = total > 0 ? Math.round((solved / total) * 100) : 0;

  const stats = [
    { label: "Problems Attempted", value: total, color: "text-[var(--accent)]" },
    { label: "Problems Solved", value: solved, color: "text-[var(--success)]" },
    { label: "Success Rate", value: `${rate}%`, color: "text-[var(--warning)]" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
        >
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
