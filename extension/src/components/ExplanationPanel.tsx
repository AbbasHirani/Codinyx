import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";

interface Section {
  title: string;
  lines: string[];
}

function parseIntoSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      if (current) current.lines.push("");
      continue;
    }
    if (/^[A-Z][A-Z0-9 ?''"\-/]{3,}$/.test(line.trim())) {
      if (current) sections.push(current);
      current = { title: line.trim(), lines: [] };
    } else {
      if (!current) current = { title: "", lines: [] };
      current.lines.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

const SECTION_CONFIG = [
  {
    match: /asking|what is|what's|what it/i,
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    titleBg: "bg-sky-500/10",
    bullet: "bg-sky-400",
  },
  {
    match: /input|output|understand the/i,
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
    titleBg: "bg-teal-500/10",
    bullet: "bg-teal-400",
  },
  {
    match: /walk|example|step by step/i,
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    titleBg: "bg-emerald-500/10",
    bullet: "bg-emerald-400",
  },
  {
    match: /key insight|the insight|the key|trick/i,
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    titleBg: "bg-amber-500/10",
    bullet: "bg-amber-400",
  },
  {
    match: /approach|two way|two approach|method|solution/i,
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    titleBg: "bg-violet-500/10",
    bullet: "bg-violet-400",
  },
  {
    match: /watch|careful|edge|trap|common|confusion|really asking/i,
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    titleBg: "bg-orange-500/10",
    bullet: "bg-orange-400",
  },
];

const DEFAULT_STYLE = SECTION_CONFIG[4];

function getSectionStyle(title: string) {
  for (const cfg of SECTION_CONFIG) {
    if (cfg.match.test(title)) return cfg;
  }
  return DEFAULT_STYLE;
}

function SectionLines({
  lines,
  style,
}: {
  lines: string[];
  style: (typeof SECTION_CONFIG)[0];
}) {
  const paragraphs: string[][] = [];
  let para: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (para.length) {
        paragraphs.push(para);
        para = [];
      }
    } else {
      para.push(line);
    }
  }
  if (para.length) paragraphs.push(para);

  return (
    <>
      {paragraphs.map((group, pi) => (
        <div key={pi} className={`flex flex-col gap-1 ${pi > 0 ? "mt-1" : ""}`}>
          {group.map((line, li) => {
            if (/^[-•]\s/.test(line)) {
              return (
                <div key={li} className="flex items-start gap-2">
                  <span className={`mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.bullet}`} />
                  <p className="text-xs text-[#c8c8d8] leading-relaxed">
                    {line.replace(/^[-•]\s/, "")}
                  </p>
                </div>
              );
            }

            const numMatch = line.match(/^(\d+)[.)]\s+(.*)/);
            if (numMatch) {
              return (
                <div key={li} className="flex items-start gap-2">
                  <span
                    className={`text-[10px] font-bold mt-0.5 flex-shrink-0 w-4 text-right ${style.text}`}
                  >
                    {numMatch[1]}.
                  </span>
                  <p className="text-xs text-[#c8c8d8] leading-relaxed">{numMatch[2]}</p>
                </div>
              );
            }

            const approachMatch = line.match(/^(Approach \d+\s*[—\-]\s*.+?):\s*(.*)/i);
            if (approachMatch) {
              return (
                <div key={li} className="mt-1">
                  <p className={`text-[10px] font-semibold ${style.text} mb-0.5`}>
                    {approachMatch[1].trim()}
                  </p>
                  {approachMatch[2] && (
                    <p className="text-xs text-[#c8c8d8] leading-relaxed">{approachMatch[2]}</p>
                  )}
                </div>
              );
            }

            return (
              <p key={li} className="text-xs text-[#c8c8d8] leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      ))}
    </>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  const style = getSectionStyle(section.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border ${style.border} overflow-hidden`}
    >
      {section.title && (
        <div className={`px-3 py-2 border-b ${style.border} ${style.titleBg}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
            {section.title}
          </p>
        </div>
      )}
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <SectionLines lines={section.lines} style={style} />
      </div>
    </motion.div>
  );
}

export default function ExplanationPanel() {
  const { explanation, problem, setStep } = useSession(
    useShallow((s) => ({
      explanation: s.explanation,
      problem: s.problem,
      setStep: s.setStep,
    }))
  );

  const tags = (problem?.tags as string[]) ?? [];
  const hasArray = tags.some((t) =>
    ["array", "two pointers", "sliding window"].includes(t.toLowerCase())
  );
  const hasDP = tags.some((t) =>
    ["dynamic programming", "dp", "memoization"].includes(t.toLowerCase())
  );

  const sections = parseIntoSections(explanation ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wide">
          Explanation
        </h2>
        <button
          onClick={() => setStep("hinting")}
          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
        >
          Got it → Hints
        </button>
      </div>

      {sections.map((section, i) => (
        <SectionCard key={i} section={section} index={i} />
      ))}

      {hasArray && <ArrayVisualizer />}
      {hasDP && !hasArray && <DPVisualizer />}

      <button
        onClick={() => setStep("hinting")}
        className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
      >
        I understand — get hints when stuck
      </button>
    </motion.div>
  );
}

function ArrayVisualizer() {
  const items = [3, 1, 4, 1, 5, 9, 2, 6];
  return (
    <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26]">
      <p className="text-[10px] text-[#6b6b7a] uppercase tracking-wide font-medium mb-3">
        Array concept
      </p>
      <div className="flex gap-1.5 justify-center flex-wrap">
        {items.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="w-8 h-8 rounded-md bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-mono text-violet-300"
          >
            {v}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-12 mt-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-3 bg-emerald-400" />
          <span className="text-[9px] text-emerald-400 font-mono">L</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-3 bg-orange-400" />
          <span className="text-[9px] text-orange-400 font-mono">R</span>
        </div>
      </div>
      <p className="text-[10px] text-[#6b6b7a] text-center mt-2">
        Two-pointer technique — move inward
      </p>
    </div>
  );
}

function DPVisualizer() {
  const grid = [
    [0, 1, 2, 3],
    [1, 0, 1, 2],
    [2, 1, 0, 1],
    [3, 2, 1, 0],
  ];
  const maxVal = 3;
  return (
    <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26]">
      <p className="text-[10px] text-[#6b6b7a] uppercase tracking-wide font-medium mb-3">
        DP table concept
      </p>
      <div className="flex justify-center">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(4, 1.75rem)` }}>
          {grid.flat().map((val, i) => {
            const intensity = val / maxVal;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-mono"
                style={{
                  background: `rgba(139, 92, 246, ${0.1 + intensity * 0.5})`,
                  color: intensity > 0.5 ? "#c4b5fd" : "#6b6b7a",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                {val}
              </motion.div>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-[#6b6b7a] text-center mt-3">DP table fills bottom-up</p>
    </div>
  );
}
