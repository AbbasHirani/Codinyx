"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface Step {
  array: number[];
  pointers?: { index: number; label: string; color: string }[];
  highlight?: number[];
  description?: string;
}

interface ArrayVisualizerProps {
  steps: Step[];
}

export function ArrayVisualizer({ steps }: ArrayVisualizerProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  const step = steps[current];
  const max = Math.max(...steps.flatMap((s) => s.array), 1);

  function prev() {
    setCurrent((c) => Math.max(0, c - 1));
  }

  function next() {
    setCurrent((c) => Math.min(steps.length - 1, c + 1));
  }

  function getCellColor(idx: number): string {
    if (step.pointers?.some((p) => p.index === idx)) return "#7c3aed";
    if (step.highlight?.includes(idx)) return "#f59e0b";
    return "#2a2a35";
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 space-y-4">
      {/* Array cells */}
      <div className="flex gap-1.5 overflow-x-auto py-2">
        {step.array.map((val, idx) => {
          const pointer = step.pointers?.find((p) => p.index === idx);
          return (
            <div key={idx} className="flex flex-col items-center gap-1 min-w-10">
              {pointer && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: pointer.color }}
                  className="text-[10px] font-bold"
                >
                  {pointer.label}
                </motion.span>
              )}
              <motion.div
                layout
                animate={{ backgroundColor: getCellColor(idx) }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold border border-[var(--card-border)]"
              >
                {val}
              </motion.div>
              <span className="text-[10px] text-[var(--muted)]">{idx}</span>
            </div>
          );
        })}
      </div>

      {/* Description */}
      {step.description && (
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-[var(--muted)]"
          >
            {step.description}
          </motion.p>
        </AnimatePresence>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrent(0)}
          disabled={current === 0}
          className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={prev}
          disabled={current === 0}
          className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]"
        >
          ‹
        </button>
        <span className="text-xs text-[var(--muted)] mx-2">
          {current + 1} / {steps.length}
        </span>
        <button
          onClick={next}
          disabled={current === steps.length - 1}
          className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]"
        >
          ›
        </button>
        <button
          onClick={() => setCurrent(steps.length - 1)}
          disabled={current === steps.length - 1}
          className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 text-[var(--muted)]"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function twoSumSteps(nums: number[], target: number): Step[] {
  const steps: Step[] = [
    { array: nums, description: `Find two numbers that add to ${target}`, pointers: [] },
  ];
  const map: Record<number, number> = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      steps.push({
        array: nums,
        highlight: [map[complement], i],
        description: `Found! nums[${map[complement]}] + nums[${i}] = ${complement} + ${nums[i]} = ${target}`,
      });
      break;
    }
    steps.push({
      array: nums,
      pointers: [{ index: i, label: "i", color: "#a78bfa" }],
      description: `Checking index ${i}: value=${nums[i]}, need ${complement}. Store in hashmap.`,
    });
    map[nums[i]] = i;
  }
  return steps;
}
