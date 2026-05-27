"use client";

import { useState } from "react";
import { Settings, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const MENTOR_MODES = [
  {
    value: "encouraging",
    label: "Encouraging",
    desc: "Warm, positive tone. Celebrates your progress and cheers you on.",
  },
  {
    value: "neutral",
    label: "Neutral",
    desc: "Clear and concise. Just the facts and actionable guidance.",
  },
  {
    value: "strict",
    label: "Strict",
    desc: "Direct and demanding. Pushes you to think harder before helping.",
  },
];

export default function SettingsPage() {
  const [mentorMode, setMentorMode] = useState("neutral");
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorMode }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--accent)]" />
          Settings
        </h1>
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold">Mentor Personality</h2>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Choose how the AI tutor communicates with you.
        </p>

        <div className="space-y-2">
          {MENTOR_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMentorMode(m.value)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                mentorMode === m.value
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--card-border)] hover:border-[var(--muted)]/50"
              )}
            >
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={save}
          className="px-5 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
        >
          {saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
