import type { ScrapedContext } from "@/lib/types";

function getCode(): string {
  try {
    const cm = document.querySelector<HTMLElement & { CodeMirror?: { getValue(): string } }>(".CodeMirror");
    if (cm?.CodeMirror) return cm.CodeMirror.getValue();
  } catch {/* ignore */}

  try {
    const ace = (window as unknown as { ace?: { edit(el: HTMLElement): { getValue(): string } } }).ace;
    const aceEl = document.querySelector<HTMLElement>(".ace_editor");
    if (ace && aceEl) return ace.edit(aceEl).getValue();
  } catch {/* ignore */}

  return "";
}

function getLanguage(): string {
  const el = document.querySelector<HTMLElement>(".select-language .select-option-label") ||
    document.querySelector<HTMLElement>("[class*='language'] [class*='selected']");
  const raw = el?.innerText?.trim().toLowerCase() || "python";
  if (raw.includes("python")) return "python";
  if (raw.includes("javascript")) return "javascript";
  if (raw.includes("java")) return "java";
  if (raw.includes("c++") || raw.includes("cpp")) return "cpp";
  return raw;
}

export function scrapeHackerRank(): ScrapedContext | null {
  const title = (
    document.querySelector<HTMLElement>(".challenge-page-label") ||
    document.querySelector<HTMLElement>(".ui-icon-label") ||
    document.querySelector<HTMLElement>("h1")
  )?.innerText?.trim();

  const description = (
    document.querySelector<HTMLElement>(".challenge-body-html .msB") ||
    document.querySelector<HTMLElement>(".challenge-body-html") ||
    document.querySelector<HTMLElement>(".problem-statement")
  )?.innerText?.trim();

  if (!title || !description) return null;

  return {
    platform: "hackerrank",
    title,
    description,
    code: getCode(),
    language: getLanguage(),
    url: window.location.href,
  };
}
