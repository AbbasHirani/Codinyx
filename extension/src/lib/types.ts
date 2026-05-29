export type Platform = "leetcode" | "hackerrank" | "codeforces" | "geeksforgeeks";

export interface ScrapedContext {
  platform: Platform;
  title: string;
  description: string;
  code: string;
  language: string;
  difficulty?: string;
  url: string;
}

export interface ExtensionMessage {
  type:
    | "CONTEXT_UPDATE"
    | "GET_CONTEXT"
    | "GET_CODE"
    | "CODE_RESPONSE"
    | "CONTEXT_RESPONSE"
    | "PROBLEM_CHANGED"
    | "SUBMISSION_ACCEPTED";
  payload?: ScrapedContext | { code: string; language: string } | null;
}

export interface ApiProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  constraints: string | null;
  sampleIO: { input: string; output: string }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface SessionState {
  token: string | null;
  problemId: string | null;
  attemptId: string | null;
  problem: ApiProblem | null;
  context: ScrapedContext | null;
  step: "login" | "idle" | "loading" | "chat" | "understand" | "explaining" | "hinting" | "debugging" | "solved";
  messages: ChatMessage[];
  hints: { tier: number; text: string }[];
  diagnosis: Diagnosis | null;
  explanation: string | null;
  resources: Resource[] | null;
  error: string | null;
}

export interface Diagnosis {
  rootCause?: string;
  linesHint?: string;
  suggestedChange?: string;
  nextTest?: string;
  steps?: string[];
  bugLine?: number;
  bugDescription?: string;
  suggestedFix?: string;
  allPassed?: boolean;
}

export interface Resource {
  type: "youtube" | "article";
  query: string;
  label: string;
}

export const BACKEND_URL =
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  "http://localhost:3000";
