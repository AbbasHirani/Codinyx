"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { HintPanel } from "@/components/hint/HintPanel";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { UnderstandCheck } from "@/components/problem/UnderstandCheck";
import { ProblemStatement } from "@/components/problem/ProblemStatement";
import { ArrayVisualizer, twoSumSteps } from "@/components/visualizer/ArrayVisualizer";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  constraints?: string | null;
  sampleIO: { input: string; output: string }[];
}

interface Attempt {
  id: string;
  code: string;
  language: string;
}

const LANGUAGES = ["python", "javascript", "typescript", "cpp", "java", "go"];

export function ProblemWorkspace({ problem, attempt }: { problem: Problem; attempt: Attempt }) {
  const [code, setCode] = useState(attempt.code);
  const [language, setLanguage] = useState(attempt.language);
  const [highlightLines, setHighlightLines] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const router = useRouter();

  async function handleSolved() {
    setSolved(true);
    setSavingNote(true);
    await fetch("/api/notebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id, code, language }),
    });
    setSavingNote(false);
    setNoteSaved(true);
  }

  const isArrayProblem = problem.tags.includes("arrays") || problem.tags.includes("two-pointers");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
        {/* Left column */}
        <div className="space-y-4">
          <ProblemStatement problem={problem} />
          <UnderstandCheck problemId={problem.id} tags={problem.tags} />

          {isArrayProblem && (
            <ArrayVisualizer steps={twoSumSteps([2, 7, 11, 15], 9)} />
          )}

          {/* Editor */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--card-border)]">
              <span className="text-sm font-semibold">Solution</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ml-auto text-xs bg-[var(--background)] border border-[var(--card-border)] rounded px-2 py-1 text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              highlightLines={highlightLines}
              height="400px"
            />
          </div>

          <DebugPanel
            problemId={problem.id}
            code={code}
            language={language}
            attemptId={attempt.id}
            onHighlightLines={setHighlightLines}
            onSolved={handleSolved}
          />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {solved && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold text-sm">Problem Solved!</span>
              </div>
              {savingNote ? (
                <p className="text-xs text-green-400/70">Generating notebook entry...</p>
              ) : noteSaved ? (
                <button
                  onClick={() => router.push("/notebook")}
                  className="flex items-center gap-1.5 text-xs text-green-400 hover:underline mt-1"
                >
                  <BookOpen className="w-3 h-3" />
                  View in Notebook →
                </button>
              ) : null}
            </div>
          )}

          <HintPanel
            problemId={problem.id}
            attemptId={attempt.id}
            userCode={code || undefined}
          />
        </div>
      </div>
    </div>
  );
}
