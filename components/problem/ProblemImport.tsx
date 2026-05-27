"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Link as LinkIcon, FileText } from "lucide-react";

export function ProblemImport() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleImport() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/problems/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url: url || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/problems/${data.problemId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-[var(--accent)]" />
        <h2 className="text-sm font-semibold">Import a Problem</h2>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium mb-1.5">
          <LinkIcon className="w-3 h-3" />
          Problem URL (optional)
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://leetcode.com/problems/two-sum/"
          className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium mb-1.5">
          <FileText className="w-3 h-3" />
          Problem Description *
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full problem description here including examples and constraints..."
          rows={7}
          className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors resize-none font-mono"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={loading || !text.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Parsing with AI...
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            Import Problem
          </>
        )}
      </button>
    </div>
  );
}
