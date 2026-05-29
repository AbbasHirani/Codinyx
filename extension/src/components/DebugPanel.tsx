import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { useProblem } from "@/hooks/useProblem";
import { fetchDebug } from "@/lib/api";

export default function DebugPanel() {
  const { diagnosis, problemId, attemptId, setDiagnosis, setStep, setSolved } = useSession(
    useShallow((s) => ({
      diagnosis: s.diagnosis,
      problemId: s.problemId,
      attemptId: s.attemptId,
      setDiagnosis: s.setDiagnosis,
      setStep: s.setStep,
      setSolved: s.setSolved,
    }))
  );
  const { getFreshCode } = useProblem();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (!problemId) return;
    setLoading(true);
    try {
      const { code, language } = await getFreshCode();
      const result = await fetchDebug(problemId, code, language, attemptId ?? undefined);
      if (result.allPassed) {
        setSolved();
      } else {
        setDiagnosis(result.diagnosis ?? null);
      }
    } catch {
      // keep current diagnosis
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wide">Code Review</h2>
        <button
          onClick={() => setStep("hinting")}
          className="text-[10px] text-[#6b6b7a] hover:text-[#8b8b9a] transition-colors"
        >
          ← Hints
        </button>
      </div>

      {!diagnosis && (
        <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26] text-center">
          <p className="text-xs text-[#6b6b7a]">No diagnosis available. Refresh to analyze your code.</p>
        </div>
      )}

      {diagnosis && (
        <AnimatePresence mode="wait">
          <motion.div
            key="diagnosis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {diagnosis.rootCause && (
              <StepCard index={1} label="What I see" text={diagnosis.rootCause} color="red" />
            )}
            {diagnosis.linesHint && (
              <StepCard index={2} label="Look here" text={diagnosis.linesHint} color="orange" />
            )}
            {diagnosis.suggestedChange && (
              <StepCard index={3} label="Try this" text={diagnosis.suggestedChange} color="violet" />
            )}
            {diagnosis.nextTest && (
              <StepCard index={4} label="Test with" text={diagnosis.nextTest} color="emerald" />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Re-analyze current code →"}
        </button>
        <button
          onClick={() => { setSolved(); }}
          className="w-full py-2 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/5 text-emerald-400 text-xs font-medium transition-colors"
        >
          ✓ Mark as solved
        </button>
      </div>
    </motion.div>
  );
}

function StepCard({
  index,
  label,
  text,
  color,
}: {
  index: number;
  label: string;
  text: string;
  color: "red" | "orange" | "violet" | "emerald";
}) {
  const colorMap = {
    red: "border-red-500/25 bg-red-500/5",
    orange: "border-orange-500/25 bg-orange-500/5",
    violet: "border-violet-500/25 bg-violet-500/5",
    emerald: "border-emerald-500/25 bg-emerald-500/5",
  };
  const labelColorMap = {
    red: "text-red-400",
    orange: "text-orange-400",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-3 rounded-xl border ${colorMap[color]}`}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${labelColorMap[color]}`}>
        {label}
      </p>
      <p className="text-xs text-[#c8c8d8] leading-relaxed">{text}</p>
    </motion.div>
  );
}
