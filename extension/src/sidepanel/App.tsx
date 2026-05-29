import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { useAuth } from "@/hooks/useAuth";
import { useProblem } from "@/hooks/useProblem";
import type { ExtensionMessage } from "@/lib/types";
import LoginScreen from "@/components/LoginScreen";
import LoadingScreen from "@/components/LoadingScreen";
import ProblemHeader from "@/components/ProblemHeader";
import ChatPanel from "@/components/ChatPanel";
import ResourcesPanel from "@/components/ResourcesPanel";

export default function App() {
  const { isLoggedIn } = useAuth();
  const { loadFromTab } = useProblem();
  const { step, token, error, setError, setSolved } = useSession(
    useShallow((s) => ({
      step: s.step,
      token: s.token,
      error: s.error,
      setError: s.setError,
      setSolved: s.setSolved,
    }))
  );

  // Initial load on login
  useEffect(() => {
    if (token) loadFromTab();
  }, [token, loadFromTab]);

  // Listen for background messages: new problem detected + LeetCode accepted
  useEffect(() => {
    const listener = (msg: ExtensionMessage) => {
      if (msg.type === "PROBLEM_CHANGED") {
        const s = useSession.getState().step;
        if (s === "idle" || s === "loading") loadFromTab();
      }
      if (msg.type === "SUBMISSION_ACCEPTED") {
        const s = useSession.getState().step;
        if (s === "chat" || s === "hinting" || s === "debugging" || s === "understand") setSolved();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [loadFromTab, setSolved]);

  if (!isLoggedIn || step === "login") return <LoginScreen />;
  if (step === "idle") return <IdleScreen onRefresh={loadFromTab} error={error} onDismissError={() => setError(null)} />;
  if (step === "loading") return <LoadingScreen />;

  const isChatStep = step === "chat" || step === "understand" || step === "explaining" || step === "hinting" || step === "debugging";

  return (
    <div className="flex flex-col h-screen">
      <ProblemHeader />
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <div className="flex-1 min-h-0">
        {isChatStep && <ChatPanel />}
        {step === "solved" && <div className="h-full overflow-y-auto"><ResourcesPanel /></div>}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2">
      <span className="text-red-400 text-xs mt-0.5 flex-shrink-0">⚠</span>
      <p className="text-[11px] text-red-300 leading-relaxed flex-1">{message}</p>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-300 text-xs flex-shrink-0">✕</button>
    </div>
  );
}

function IdleScreen({
  onRefresh,
  error,
  onDismissError,
}: {
  onRefresh: () => void;
  error: string | null;
  onDismissError: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-white">No problem detected</h2>

      {error ? (
        <div className="w-full px-2 py-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-left">
          <span className="text-red-400 text-xs mt-0.5">⚠</span>
          <p className="text-[11px] text-red-300 leading-relaxed flex-1">{error}</p>
          <button onClick={onDismissError} className="text-red-400 hover:text-red-300 text-xs">✕</button>
        </div>
      ) : (
        <p className="text-xs text-[#6b6b7a] leading-relaxed">
          Navigate to a coding problem on LeetCode, HackerRank, Codeforces, or GeeksForGeeks, then refresh.
        </p>
      )}

      <button
        onClick={onRefresh}
        className="mt-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
      >
        Refresh
      </button>
    </div>
  );
}
