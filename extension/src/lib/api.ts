import { BACKEND_URL, type ApiProblem, type Diagnosis, type Resource } from "./types";

async function getToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("token", (r) => resolve(r.token ?? null));
  });
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error ?? "Login failed");
  }
  const { token } = await res.json();
  await chrome.storage.local.set({ token });
  return token;
}

export async function logout(): Promise<void> {
  await chrome.storage.local.remove("token");
}

export async function registerExtensionContext(body: {
  title: string;
  description: string;
  code: string;
  language: string;
  platform: string;
  url?: string;
  difficulty?: string;
}): Promise<{ problemId: string; attemptId: string; problem: ApiProblem }> {
  const res = await apiFetch("/api/extension/context", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to register context");
  return res.json();
}

export async function fetchHint(
  problemId: string,
  tier: number,
  attemptId?: string,
  userCode?: string
): Promise<string> {
  const res = await apiFetch("/api/hint", {
    method: "POST",
    body: JSON.stringify({ problemId, tier, attemptId, userCode }),
  });
  if (!res.ok) throw new Error("Failed to get hint");
  const { hint } = await res.json();
  return hint;
}

export async function fetchExplanation(
  problemId: string,
  level: "partial" | "none"
): Promise<string> {
  const res = await apiFetch("/api/explain", {
    method: "POST",
    body: JSON.stringify({ problemId, level }),
  });
  if (!res.ok) throw new Error("Failed to get explanation");
  const { explanation } = await res.json();
  return explanation;
}

export async function fetchDebug(
  problemId: string,
  code: string,
  language: string,
  attemptId?: string
): Promise<{ allPassed: boolean; diagnosis?: Diagnosis }> {
  const res = await apiFetch("/api/debug", {
    method: "POST",
    body: JSON.stringify({ problemId, code, language, attemptId }),
  });
  if (!res.ok) throw new Error("Debug failed");
  return res.json();
}

export async function generateNotebook(
  problemId: string,
  code: string,
  language: string
): Promise<void> {
  await apiFetch("/api/notebook", {
    method: "POST",
    body: JSON.stringify({ problemId, code, language }),
  });
}

export async function sendChatMessage(
  problemId: string,
  messages: { role: "user" | "assistant"; content: string }[],
  attemptId?: string
): Promise<{ reply: string }> {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ problemId, messages, attemptId }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

export async function fetchResources(
  tags: string[],
  title: string
): Promise<Resource[]> {
  const res = await apiFetch("/api/resources", {
    method: "POST",
    body: JSON.stringify({ tags, title }),
  });
  if (!res.ok) return [];
  const { links } = await res.json();
  return links ?? [];
}
