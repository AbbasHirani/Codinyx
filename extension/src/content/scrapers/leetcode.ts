import type { ScrapedContext } from "@/lib/types";

function getTitle(): string {
  return (
    document.querySelector<HTMLElement>('[data-cy="question-title"]')?.innerText ||
    document.querySelector<HTMLElement>(".text-title-large a")?.innerText ||
    document.querySelector<HTMLElement>("h1")?.innerText ||
    document.title.split(" - ")[0]
  ).trim();
}

function getDifficulty(): string {
  const el =
    document.querySelector<HTMLElement>('[diff]') ||
    document.querySelector<HTMLElement>(".difficulty-label") ||
    document.querySelector<HTMLElement>("[class*='difficulty']");
  return el?.innerText?.trim() || "";
}

function getDescription(): string {
  const el =
    document.querySelector<HTMLElement>("[data-track-load='description_content']") ||
    document.querySelector<HTMLElement>(".elfjS") ||
    document.querySelector<HTMLElement>("[class*='question-content']") ||
    document.querySelector<HTMLElement>(".content__u3I1") ||
    document.querySelector<HTMLElement>("[class*='Description__content']") ||
    document.querySelector<HTMLElement>("[class*='description__']");
  if (el?.innerText?.trim()) return el.innerText.trim();

  // Last resort: find the largest <p>-containing div in the main content area
  const candidates = document.querySelectorAll<HTMLElement>(
    "div[class] p"
  );
  let best = "";
  for (const p of candidates) {
    const txt = p.innerText.trim();
    if (txt.length > best.length) best = txt;
  }
  return best;
}

type MonacoModel = { getValue(): string; getLanguageId?(): string };
type MonacoWindow = { monaco?: { editor?: { getModels?(): MonacoModel[] } } };

function getCode(): string {
  try {
    const models = (window as unknown as MonacoWindow).monaco?.editor?.getModels?.();
    if (models && models.length > 0) {
      const code = models[models.length - 1].getValue();
      if (code.trim()) return code;
    }
  } catch {/* ignore */}

  try {
    const cm = document.querySelector<HTMLElement & { CodeMirror?: { getValue(): string } }>(".CodeMirror");
    if (cm?.CodeMirror) return cm.CodeMirror.getValue();
  } catch {/* ignore */}

  const lines = Array.from(document.querySelectorAll<HTMLElement>(".view-lines .view-line"));
  if (lines.length > 0) return lines.map((l) => l.innerText).join("\n");

  return "";
}

function normalizeLanguage(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("python")) return "python";
  if (r.includes("javascript") || r === "js") return "javascript";
  if (r.includes("typescript") || r === "ts") return "typescript";
  if (r.includes("c++") || r === "cpp") return "cpp";
  if (r.includes("java") && !r.includes("script")) return "java";
  if (r === "go" || r === "golang") return "go";
  if (r.includes("rust")) return "rust";
  if (r.includes("c#") || r === "csharp") return "csharp";
  if (r === "c") return "c";
  if (r.includes("kotlin")) return "kotlin";
  if (r.includes("swift")) return "swift";
  if (r.includes("ruby")) return "ruby";
  return r;
}

function detectLanguageFromCode(code: string): string {
  if (!code.trim()) return "python";
  if (/vector\s*<|#include\s*<|std::|->|::\s*\w|class Solution\s*\{/.test(code)) return "cpp";
  if (/public\s+(class|static)|import\s+java\.|ArrayList<|HashMap</.test(code)) return "java";
  if (/def\s+\w+\s*\(.*\)\s*(->\s*\w+\s*)?:/.test(code) && !code.includes("{")) return "python";
  if (/const\s+\w+\s*[=:]|let\s+\w+\s*[=:]|function\s+\w+\s*\(|=>\s*\{/.test(code)) return "javascript";
  if (/:\s*(int|str|List|Dict|Optional)\b/.test(code)) return "python";
  if (/^func\s+\w+/.test(code) || /\[\]int|\[\]string/.test(code)) return "go";
  if (/^fn\s+\w+|impl\s+\w+|Vec<|->/.test(code)) return "rust";
  return "python";
}

function getLanguage(code?: string): string {
  // 1. Monaco model language ID — most reliable
  try {
    const models = (window as unknown as MonacoWindow).monaco?.editor?.getModels?.();
    if (models && models.length > 0) {
      const langId = models[models.length - 1].getLanguageId?.();
      if (langId) return normalizeLanguage(langId);
    }
  } catch {/* ignore */}

  // 2. DOM selectors — try several since LeetCode has redesigned the editor toolbar
  const selectors = [
    "[data-cy='lang-select'] .ant-select-selection-item",
    ".ant-select-selection-item",
    "[class*='lang-select'] [class*='selected']",
    "[class*='CodeEditor'] button[class*='rounded']",
    "button[class*='rounded'][class*='gap-1']",
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    const text = el?.innerText?.trim();
    if (text && text.length > 0 && text.length < 20) {
      const lang = normalizeLanguage(text);
      if (lang !== text.toLowerCase()) return lang; // matched a known language
    }
  }

  // 3. Infer from code content
  return detectLanguageFromCode(code ?? getCode());
}

export function watchForAccepted(callback: () => void): void {
  let fired = false;

  const check = () => {
    if (fired) return;
    // LeetCode's submission result element (stable data attribute)
    const resultEl = document.querySelector("[data-e2e-locator='submission-result']");
    if (resultEl?.textContent?.trim() === "Accepted") {
      fired = true;
      callback();
      return;
    }
    // Fallback: look for any prominent "Accepted" heading in the results area
    const headings = document.querySelectorAll<HTMLElement>(
      "[class*='result'] h3, [class*='result'] h2, [class*='ResultTitle'], [class*='result-title']"
    );
    for (const el of headings) {
      if (el.innerText?.trim() === "Accepted") {
        fired = true;
        callback();
        return;
      }
    }
  };

  const observer = new MutationObserver(check);
  observer.observe(document.body, { childList: true, subtree: true });

  // Reset when the user navigates to a new problem (SPA title change)
  const titleObserver = new MutationObserver(() => {
    fired = false;
  });
  titleObserver.observe(document.querySelector("title") ?? document.head, {
    childList: true,
    characterData: true,
  });
}

export function scrapeLeetCode(): ScrapedContext | null {
  const title = getTitle();
  if (!title) return null;
  const description = getDescription();
  const code = getCode();

  return {
    platform: "leetcode",
    title,
    description,
    code,
    language: getLanguage(code),
    difficulty: getDifficulty(),
    url: window.location.href,
  };
}
