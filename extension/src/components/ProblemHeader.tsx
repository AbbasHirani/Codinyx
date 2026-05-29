import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { useProblem } from "@/hooks/useProblem";

const PLATFORM_LABELS: Record<string, string> = {
  leetcode: "LeetCode",
  hackerrank: "HackerRank",
  codeforces: "Codeforces",
  geeksforgeeks: "GFG",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard: "text-red-400 bg-red-400/10",
};

export default function ProblemHeader() {
  const { context, step } = useSession(useShallow((s) => ({ context: s.context, step: s.step })));
  const { loadFromTab } = useProblem();

  if (!context) return null;

  const diffKey = (context.difficulty ?? "").toLowerCase();
  const diffColor = DIFFICULTY_COLORS[diffKey] ?? "text-[#6b6b7a] bg-[#1a1a1f]";

  return (
    <div className="px-4 py-3 border-b border-[#1e1e26] bg-[#0f0f11] sticky top-0 z-10">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h1 className="text-sm font-semibold text-white leading-tight flex-1 min-w-0 truncate">
          {context.title}
        </h1>
        <button
          onClick={loadFromTab}
          title="Reload from tab"
          className="flex-shrink-0 p-1 rounded-md hover:bg-[#1a1a1f] text-[#4a4a55] hover:text-[#8b8b9a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e26] text-[#8b8b9a] font-medium">
          {PLATFORM_LABELS[context.platform] ?? context.platform}
        </span>
        {context.difficulty && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${diffColor}`}>
            {context.difficulty}
          </span>
        )}
        <span className="text-[10px] text-[#3a3a45] ml-auto capitalize">{step}</span>
      </div>
    </div>
  );
}
