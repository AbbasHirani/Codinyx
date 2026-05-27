"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface SkillProfile {
  tag: string;
  proficiency: number;
}

interface Props {
  skillProfile: SkillProfile[];
}

const ALL_TAGS = [
  "arrays", "strings", "hashmaps", "trees", "graphs",
  "dynamic-programming", "binary-search", "recursion", "greedy",
];

export function WeaknessHeatmap({ skillProfile }: Props) {
  const profileMap = Object.fromEntries(skillProfile.map((s) => [s.tag, s.proficiency]));

  const data = ALL_TAGS.map((tag) => ({
    tag: tag.replace("-", " "),
    proficiency: profileMap[tag] ?? 0,
  }));

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">
        Skill Heatmap
      </h2>
      {skillProfile.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-8">
          Solve problems to build your skill profile.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data}>
            <PolarGrid stroke="#2a2a35" />
            <PolarAngleAxis
              dataKey="tag"
              tick={{ fill: "#8b8b99", fontSize: 11 }}
            />
            <Radar
              name="Proficiency"
              dataKey="proficiency"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.3}
            />
            <Tooltip
              contentStyle={{ background: "#1a1a1f", border: "1px solid #2a2a35", borderRadius: 8 }}
              labelStyle={{ color: "#f1f0f5", fontSize: 12 }}
              formatter={(v) => [`${Math.round(Number(v) || 0)}%`, "Proficiency"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
