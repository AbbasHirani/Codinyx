import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { generateNotebook, fetchResources } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { useProblem } from "@/hooks/useProblem";

export default function ResourcesPanel() {
  const { problemId, problem, resources, setResources } = useSession(
    useShallow((s) => ({ problemId: s.problemId, problem: s.problem, resources: s.resources, setResources: s.setResources }))
  );
  const { getFreshCode } = useProblem();
  const [notebookDone, setNotebookDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!problemId || !problem) return;
    const tags = (problem.tags as string[]) ?? [];

    Promise.all([
      fetchResources(tags, problem.title).then(setResources),
      getFreshCode().then(({ code, language }) =>
        generateNotebook(problemId, code, language).then(() => setNotebookDone(true))
      ),
    ]).finally(() => setLoading(false));
  }, [problemId, problem]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-4 flex flex-col gap-4"
    >
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/25 text-center">
        <span className="text-2xl">🎉</span>
        <p className="text-sm font-semibold text-white mt-2">Problem solved!</p>
        <p className="text-xs text-[#6b6b7a] mt-1">
          {notebookDone ? "Added to your notebook ✓" : "Saving to notebook…"}
        </p>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-[#8b8b9a] uppercase tracking-wide mb-2">Learn More</h2>

        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-[#1a1a1f] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && resources && (
          <div className="flex flex-col gap-2">
            {resources.map((r, i) => (
              <ResourceCard key={i} resource={r} index={i} />
            ))}
          </div>
        )}

        {!loading && (!resources || resources.length === 0) && (
          <div className="p-4 rounded-xl bg-[#13131a] border border-[#1e1e26] text-center">
            <p className="text-xs text-[#6b6b7a]">No resources found.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ResourceCard({ resource, index }: { resource: Resource; index: number }) {
  const isYoutube = resource.type === "youtube";
  const href = isYoutube
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(resource.query)}`
    : `https://www.google.com/search?q=${encodeURIComponent(resource.query)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-[#13131a] border border-[#1e1e26] hover:border-[#2a2a35] transition-colors group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isYoutube ? "bg-red-500/15" : "bg-blue-500/15"}`}>
        {isYoutube ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white truncate group-hover:text-violet-300 transition-colors">
          {resource.label}
        </p>
        <p className="text-[10px] text-[#4a4a55]">{isYoutube ? "YouTube" : "Article"}</p>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3a3a45] flex-shrink-0">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </motion.a>
  );
}
