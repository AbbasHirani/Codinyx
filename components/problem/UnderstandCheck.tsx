"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnderstandCheckProps {
  problemId: string;
  tags: string[];
}

const OPTIONS = [
  { value: "yes", label: "I understand it", icon: CheckCircle2, color: "text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/10" },
  { value: "little", label: "Somewhat", icon: HelpCircle, color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" },
  { value: "no", label: "Not really", icon: AlertCircle, color: "text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/10" },
] as const;

export function UnderstandCheck({ problemId, tags }: UnderstandCheckProps) {
  const [answer, setAnswer] = useState<"yes" | "little" | "no" | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  async function select(val: "yes" | "little" | "no") {
    setAnswer(val);
    if (val === "yes") return;

    setLoading(true);
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId }),
    });
    const data = await res.json();
    setExplanation(data.explanation ?? "");
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 space-y-3">
      <p className="text-sm font-medium">Do you understand this problem?</p>

      <div className="flex gap-2">
        {OPTIONS.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => select(value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all",
              color,
              answer === value && "ring-1 ring-current"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="w-3.5 h-3.5 border-2 border-[var(--muted)]/30 border-t-[var(--muted)] rounded-full animate-spin" />
          Getting explanation...
        </div>
      )}

      {explanation && (
        <div className="rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-3">
          <p className="text-sm whitespace-pre-line leading-relaxed text-[var(--foreground)]">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
