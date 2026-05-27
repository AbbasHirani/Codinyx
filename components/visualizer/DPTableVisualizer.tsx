"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SkipBack, SkipForward } from "lucide-react";

interface DPStep {
  table: (number | string)[][];
  activeCell?: [number, number];
  description?: string;
}

interface DPTableVisualizerProps {
  steps: DPStep[];
  rowLabels?: string[];
  colLabels?: string[];
}

export function DPTableVisualizer({ steps, rowLabels, colLabels }: DPTableVisualizerProps) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  function getCellStyle(r: number, c: number): string {
    if (step.activeCell && step.activeCell[0] === r && step.activeCell[1] === c) {
      return "bg-[var(--primary)] text-white border-[var(--primary)]";
    }
    if (typeof step.table[r][c] !== "string" && step.table[r][c] !== 0) {
      return "bg-purple-500/10 border-purple-500/20 text-purple-200";
    }
    return "bg-[var(--background)] border-[var(--card-border)] text-[var(--muted)]";
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 space-y-4">
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono">
          {colLabels && (
            <thead>
              <tr>
                <th className="w-8" />
                {colLabels.map((l, i) => (
                  <th key={i} className="w-10 h-7 text-[var(--muted)] font-normal text-center">{l}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {step.table.map((row, r) => (
              <tr key={r}>
                {rowLabels && (
                  <td className="w-8 pr-2 text-[var(--muted)] text-right">{rowLabels[r]}</td>
                )}
                {row.map((val, c) => (
                  <td key={c} className="p-0.5">
                    <motion.div
                      animate={{ scale: step.activeCell?.[0] === r && step.activeCell?.[1] === c ? 1.1 : 1 }}
                      className={`w-10 h-10 rounded flex items-center justify-center border font-bold transition-colors ${getCellStyle(r, c)}`}
                    >
                      {val}
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step.description && (
        <p className="text-sm text-[var(--muted)]">{step.description}</p>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => setCurrent(0)} disabled={current === 0} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]">
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]">‹</button>
        <span className="text-xs text-[var(--muted)] mx-2">{current + 1} / {steps.length}</span>
        <button onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))} disabled={current === steps.length - 1} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]">›</button>
        <button onClick={() => setCurrent(steps.length - 1)} disabled={current === steps.length - 1} className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]">
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
