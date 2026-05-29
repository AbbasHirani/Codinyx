import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { registerExtensionContext } from "@/lib/api";
import type { ScrapedContext } from "@/lib/types";

async function queryActiveTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] ?? null);
    });
  });
}

async function sendMsg(tabId: number, message: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(response ?? null);
    });
  });
}

async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content/index.js"] });
    await new Promise((r) => setTimeout(r, 600));
  } catch {
    // already injected or non-injectable page
  }
}

async function getContextFromTab(): Promise<ScrapedContext | null> {
  const tab = await queryActiveTab();
  if (!tab?.id) return null;

  let response = await sendMsg(tab.id, { type: "GET_CONTEXT" });

  if (!response) {
    // Content script likely not injected — inject it and retry
    await ensureContentScript(tab.id);
    response = await sendMsg(tab.id, { type: "GET_CONTEXT" });
  }

  return (response as ScrapedContext) ?? null;
}

async function getCodeFromTab(): Promise<{ code: string; language: string }> {
  const tab = await queryActiveTab();
  if (!tab?.id) return { code: "", language: "python" };
  const response = await sendMsg(tab.id, { type: "GET_CODE" });
  return (response as { code: string; language: string }) ?? { code: "", language: "python" };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export function useProblem() {
  const { setContext, setLoaded, reset, setStep, setError } = useSession(
    useShallow((s) => ({
      setContext: s.setContext,
      setLoaded: s.setLoaded,
      reset: s.reset,
      setStep: s.setStep,
      setError: s.setError,
    }))
  );

  const loadFromTab = useCallback(async () => {
    reset();
    setStep("loading");

    const ctx = await getContextFromTab();
    if (!ctx) {
      setStep("idle");
      setError("No problem detected. Navigate to a problem page, then try again.");
      return;
    }
    setContext(ctx);

    try {
      const { problemId, attemptId, problem } = await withTimeout(
        registerExtensionContext({
          title: ctx.title,
          description: ctx.description,
          code: ctx.code,
          language: ctx.language,
          platform: ctx.platform,
          url: ctx.url,
          difficulty: ctx.difficulty,
        }),
        15000
      );
      setLoaded(problemId, attemptId, problem);
    } catch (e) {
      const msg = e instanceof Error && e.message === "timeout"
        ? "Server didn't respond — is the Next.js dev server running?"
        : "Failed to load problem from server. Try refreshing.";
      console.error("Failed to register context:", e);
      setStep("idle");
      setError(msg);
    }
  }, [reset, setContext, setLoaded, setStep, setError]);

  const getFreshCode = useCallback(() => getCodeFromTab(), []);

  return { loadFromTab, getFreshCode };
}
