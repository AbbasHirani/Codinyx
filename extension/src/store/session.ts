import { create } from "zustand";
import type { SessionState, ScrapedContext, ApiProblem, Diagnosis, Resource, ChatMessage } from "@/lib/types";

interface Actions {
  setToken: (token: string | null) => void;
  setContext: (ctx: ScrapedContext) => void;
  setLoaded: (problemId: string, attemptId: string, problem: ApiProblem) => void;
  setStep: (step: SessionState["step"]) => void;
  setExplanation: (text: string) => void;
  addHint: (tier: number, text: string) => void;
  setDiagnosis: (d: Diagnosis | null) => void;
  setSolved: () => void;
  setResources: (r: Resource[]) => void;
  setError: (msg: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  reset: () => void;
}

const initial: Omit<SessionState, keyof Actions> = {
  token: null,
  problemId: null,
  attemptId: null,
  problem: null,
  context: null,
  step: "login",
  messages: [],
  hints: [],
  diagnosis: null,
  explanation: null,
  resources: null,
  error: null,
};

export const useSession = create<SessionState & Actions>((set) => ({
  ...initial,

  setToken: (token) => set({ token, step: token ? "idle" : "login" }),
  setContext: (context) => set({ context, step: "loading", error: null }),
  setLoaded: (problemId, attemptId, problem) =>
    set({ problemId, attemptId, problem, step: "chat" }),
  setStep: (step) => set({ step }),
  setExplanation: (explanation) => set({ explanation }),
  addHint: (tier, text) =>
    set((s) => ({ hints: [...s.hints, { tier, text }], step: "hinting" })),
  setDiagnosis: (diagnosis) => set({ diagnosis, step: diagnosis ? "debugging" : "hinting" }),
  setSolved: () => set({ step: "solved" }),
  setResources: (resources) => set({ resources }),
  setError: (error) => set({ error }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  reset: () => set((s) => ({ ...initial, token: s.token, step: "idle" })),
}));
