"use client";

import { useState } from "react";
import { Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface TestResult {
  input: string;
  expected: string;
  got: string;
  passed: boolean;
  stderr?: string;
}

interface Diagnosis {
  rootCause: string;
  linesHint: string;
  suggestedChange: string;
  nextTest: string;
}

interface DebugPanelProps {
  problemId: string;
  code: string;
  language: string;
  attemptId?: string;
  onHighlightLines?: (lines: number[]) => void;
  onSolved?: () => void;
}

export function DebugPanel({ problemId, code, language, attemptId, onHighlightLines, onSolved }: DebugPanelProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [allPassed, setAllPassed] = useState(false);
  const [error, setError] = useState("");

  async function runDebug() {
    setLoading(true);
    setError("");
    setDiagnosis(null);
    setResults(null);
    setAllPassed(false);

    try {
      const res = await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, code, language, attemptId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults(data.results);
      setAllPassed(data.allPassed);

      if (data.allPassed) {
        onSolved?.();
      } else if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        const linesHint: string = data.diagnosis.linesHint ?? "";
        const match = linesHint.match(/(\d+)/g);
        if (match && onHighlightLines) {
          onHighlightLines(match.map(Number));
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Debug failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold">Debug Assistant</span>
        </div>
        <button
          onClick={runDebug}
          disabled={loading || !code.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Bug className="w-3 h-3" />
          )}
          {loading ? "Running..." : "Run & Diagnose"}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!results && !error && (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            Paste your code in the editor, then click Run & Diagnose.
          </p>
        )}

        {allPassed && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">All tests passed! Great work.</span>
          </div>
        )}

        {results && (
          <div className="space-y-1.5">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wide">Test Results</p>
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                  r.passed ? "bg-green-500/5 border border-green-500/15" : "bg-red-500/5 border border-red-500/15"
                }`}
              >
                {r.passed ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[var(--muted)]">Input: </span>
                  <code className="font-mono">{r.input}</code>
                  {!r.passed && (
                    <>
                      <span className="text-[var(--muted)] ml-2">Expected: </span>
                      <code className="font-mono text-green-400">{r.expected}</code>
                      <span className="text-[var(--muted)] ml-2">Got: </span>
                      <code className="font-mono text-red-400">{r.got || "(empty)"}</code>
                      {r.stderr && (
                        <p className="text-red-400/70 mt-1 truncate">{r.stderr}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {diagnosis && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wide">AI Diagnosis</p>

            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-2.5">
              <div>
                <p className="text-xs font-medium text-yellow-400 mb-0.5">Root Cause</p>
                <p className="text-sm">{diagnosis.rootCause}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-yellow-400 mb-0.5">Where to look</p>
                <p className="text-sm">{diagnosis.linesHint}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-yellow-400 mb-0.5">Suggested Change</p>
                <p className="text-sm">{diagnosis.suggestedChange}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400/70">Try input: <code className="font-mono">{diagnosis.nextTest}</code></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
