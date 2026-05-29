import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { useProblem } from "@/hooks/useProblem";
import { fetchHint, fetchDebug } from "@/lib/api";

const TIER_LABELS = ["", "Nudge", "Direction", "Code sketch", "Full walkthrough"];
const TIER_COLORS = ["", "emerald", "yellow", "orange", "red"] as const;

export default function HintPanel() {
  const { hints, problemId, attemptId, addHint, setStep, setSolved } = useSession(
    useShallow((s) => ({
      hints: s.hints,
      problemId: s.problemId,
      attemptId: s.attemptId,
      addHint: s.addHint,
      setStep: s.setStep,
      setSolved: s.setSolved,
    }))
  );
  const { getFreshCode } = useProblem();
  const [loading, setLoading] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);

  const nextTier = hints.length + 1;
  const canGetMoreHints = nextTier <= 3;
  const canGetTier4 = hints.length === 3;

  async function handleGetHint(tier: number) {
    if (!problemId) return;
    setLoading(true);
    try {
      const { code, language } = await getFreshCode();
      const text = await fetchHint(problemId, tier as 1 | 2 | 3 | 4, attemptId ?? undefined, code);
      addHint(tier, text);
    } catch {
      addHint(tier, "Could not load hint. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDebug() {
    if (!problemId) return;
    setDebugLoading(true);
    try {
      const { code, language } = await getFreshCode();
      const result = await fetchDebug(problemId, code, language, attemptId ?? undefined);
      if (result.allPassed) {
        setSolved();
      } else {
        useSession.getState().setDiagnosis(result.diagnosis ?? null);
        setStep("debugging");
      }
    } catch (e) {
      console.error("Debug failed:", e);
      setStep("debugging");
    } finally {
      setDebugLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wide">Hints</h2>
        <span className="text-[10px] text-[#4a4a55]">{hints.length}/4 revealed</span>
      </div>

      <AnimatePresence mode="popLayout">
        {hints.map((h, i) => (
          <HintCard key={i} tier={h.tier} text={h.text} />
        ))}
      </AnimatePresence>

      {hints.length === 0 && (
        <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26] text-center">
          <p className="text-xs text-[#6b6b7a]">Try the problem first. Hints reveal progressively.</p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-1">
        {canGetMoreHints && (
          <button
            onClick={() => handleGetHint(nextTier)}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#1a1a26] hover:bg-[#1e1e30] border border-[#2a2a3a] text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : `Get hint ${nextTier} — ${TIER_LABELS[nextTier]}`}
          </button>
        )}

        {canGetTier4 && (
          <button
            onClick={() => handleGetHint(4)}
            disabled={loading}
            className="w-full py-2 rounded-xl border border-red-500/30 hover:bg-red-500/5 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "⚠ Full walkthrough (spoiler)"}
          </button>
        )}

        <div className="border-t border-[#1e1e26] pt-2">
          <button
            onClick={handleDebug}
            disabled={debugLoading}
            className="w-full py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {debugLoading ? "Analyzing code…" : "Send my code for review →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HintCard({ tier, text }: { tier: number; text: string }) {
  const colorMap: Record<number, string> = {
    1: "border-emerald-500/25 bg-emerald-500/5",
    2: "border-yellow-500/25 bg-yellow-500/5",
    3: "border-orange-500/25 bg-orange-500/5",
    4: "border-red-500/25 bg-red-500/5",
  };
  const labelColorMap: Record<number, string> = {
    1: "text-emerald-400",
    2: "text-yellow-400",
    3: "text-orange-400",
    4: "text-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={`rounded-xl border p-3 ${colorMap[tier] ?? "border-[#2a2a35] bg-[#13131a]"}`}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${labelColorMap[tier] ?? "text-[#6b6b7a]"}`}>
        Hint {tier} · {["", "Nudge", "Direction", "Code sketch", "Full walkthrough"][tier]}
      </p>
      <p className="text-xs text-[#c8c8d8] leading-relaxed">{text}</p>
    </motion.div>
  );
}
