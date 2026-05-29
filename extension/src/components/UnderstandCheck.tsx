import { useState } from "react";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { fetchExplanation } from "@/lib/api";

export default function UnderstandCheck() {
  const { problemId, setStep, setExplanation } = useSession(
    useShallow((s) => ({ problemId: s.problemId, setStep: s.setStep, setExplanation: s.setExplanation }))
  );
  const [loading, setLoading] = useState<"partial" | "none" | null>(null);

  async function handleExplain(level: "partial" | "none") {
    if (!problemId) return;
    setLoading(level);
    try {
      const text = await fetchExplanation(problemId, level);
      setExplanation(text);
      setStep("explaining");
    } catch {
      setStep("hinting");
    } finally {
      setLoading(null);
    }
  }

  function handleYes() {
    setStep("hinting");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-5 flex flex-col gap-4"
    >
      <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26]">
        <p className="text-[11px] text-[#8b8b9a] uppercase tracking-wide font-medium mb-2">Quick check</p>
        <p className="text-sm text-white font-medium leading-relaxed">
          Do you understand what this problem is asking?
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <OptionButton
          label="Yes, I get it"
          description="Skip to hints when stuck"
          icon="✓"
          color="emerald"
          onClick={handleYes}
          disabled={loading !== null}
        />
        <OptionButton
          label="Kind of, but unsure"
          description="Get a quick AI breakdown"
          icon="~"
          color="yellow"
          onClick={() => handleExplain("partial")}
          disabled={loading !== null}
          loading={loading === "partial"}
        />
        <OptionButton
          label="No, explain it"
          description="Full explanation with visuals"
          icon="?"
          color="violet"
          onClick={() => handleExplain("none")}
          disabled={loading !== null}
          loading={loading === "none"}
        />
      </div>
    </motion.div>
  );
}

function OptionButton({
  label,
  description,
  icon,
  color,
  onClick,
  disabled,
  loading = false,
}: {
  label: string;
  description: string;
  icon: string;
  color: "emerald" | "yellow" | "violet";
  onClick: () => void;
  disabled: boolean;
  loading?: boolean;
}) {
  const colorMap = {
    emerald: "border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/5",
    yellow: "border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-500/5",
    violet: "border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-500/5",
  };
  const iconMap = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    yellow: "bg-yellow-500/15 text-yellow-400",
    violet: "bg-violet-500/15 text-violet-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border bg-[#13131a] text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[color]}`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${iconMap[color]}`}>
        {loading ? (
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white">{loading ? "Thinking…" : label}</p>
        <p className="text-[10px] text-[#6b6b7a]">{description}</p>
      </div>
    </button>
  );
}
