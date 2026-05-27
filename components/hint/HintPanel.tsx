"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HintPanelProps {
  problemId: string;
  attemptId?: string;
  userCode?: string;
}

const TIER_LABELS = ["", "Nudge", "Approach", "Outline", "Full Solution"];
const TIER_COLORS = ["", "text-blue-400", "text-yellow-400", "text-orange-400", "text-red-400"];

export function HintPanel({ problemId, attemptId, userCode }: HintPanelProps) {
  const [tier, setTier] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [warnTier4, setWarnTier4] = useState(false);

  async function fetchHint(t: number) {
    if (t === 4 && !warnTier4) {
      setWarnTier4(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, tier: t, userCode, attemptId }),
      });
      const data = await res.json();
      setHints((h) => [...h, data.hint]);
      setTier(t);
    } finally {
      setLoading(false);
      setWarnTier4(false);
    }
  }

  const nextTier = tier + 1;
  const canEscalate = nextTier <= 4;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--card-border)]">
        <Lightbulb className="w-4 h-4 text-[var(--warning)]" />
        <span className="text-sm font-semibold">Hints</span>
        {tier > 0 && (
          <span className={cn("ml-auto text-xs font-medium", TIER_COLORS[tier])}>
            Tier {tier} — {TIER_LABELS[tier]}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {hints.length === 0 && (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            Stuck? Get a hint without spoiling the solution.
          </p>
        )}

        {hints.map((h, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg px-4 py-3 text-sm border",
              i + 1 === 1 && "border-blue-500/20 bg-blue-500/5 text-blue-100",
              i + 1 === 2 && "border-yellow-500/20 bg-yellow-500/5 text-yellow-100",
              i + 1 === 3 && "border-orange-500/20 bg-orange-500/5 text-orange-100",
              i + 1 === 4 && "border-red-500/20 bg-red-500/5 text-red-100"
            )}
          >
            <p className="text-xs font-medium opacity-70 mb-1">
              {TIER_LABELS[i + 1]} hint
            </p>
            <p className="whitespace-pre-line leading-relaxed">{h}</p>
          </div>
        ))}

        {warnTier4 && (
          <div className="rounded-lg px-4 py-3 border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-300 font-medium">Show full solution?</p>
                <p className="text-xs text-red-400/70 mt-0.5">
                  This will reveal a complete working solution. Try the outline hint first.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => fetchHint(4)}
                    className="px-3 py-1.5 rounded bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Yes, show solution
                  </button>
                  <button
                    onClick={() => setWarnTier4(false)}
                    className="px-3 py-1.5 rounded bg-white/5 text-[var(--muted)] text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {canEscalate && !warnTier4 && (
          <button
            onClick={() => fetchHint(nextTier)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--card-border)] hover:bg-white/5 transition-colors text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {loading ? "Thinking..." : `Get ${TIER_LABELS[nextTier]} hint`}
          </button>
        )}
      </div>
    </div>
  );
}
