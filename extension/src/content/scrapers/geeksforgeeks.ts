import type { ScrapedContext } from "@/lib/types";

function getCode(): string {
  try {
    const cm = document.querySelector<HTMLElement & { CodeMirror?: { getValue(): string } }>(".CodeMirror");
    if (cm?.CodeMirror) return cm.CodeMirror.getValue();
  } catch {/* ignore */}

  const lines = Array.from(document.querySelectorAll<HTMLElement>(".CodeMirror-line"));
  if (lines.length > 0) return lines.map((l) => l.innerText).join("\n");

  return "";
}

export function scrapeGeeksForGeeks(): ScrapedContext | null {
  const title = (
    document.querySelector<HTMLElement>(".problems-heading") ||
    document.querySelector<HTMLElement>("[class*='problem-heading']") ||
    document.querySelector<HTMLElement>("h1")
  )?.innerText?.trim();

  const description = (
    document.querySelector<HTMLElement>("[class*='problem-statement']") ||
    document.querySelector<HTMLElement>(".problem-tab .tab-content") ||
    document.querySelector<HTMLElement>(".question_description")
  )?.innerText?.trim();

  if (!title || !description) return null;

  const diffEl = document.querySelector<HTMLElement>("[class*='difficulty']");
  const difficulty = diffEl?.innerText?.trim() || "";

  const langEl = document.querySelector<HTMLSelectElement>("[class*='lang-select'] select") ||
    document.querySelector<HTMLSelectElement>(".lang-dropdown select");
  const langText = langEl?.value?.toLowerCase() || "python";
  let language = "python";
  if (langText.includes("java")) language = "java";
  else if (langText.includes("cpp") || langText.includes("c++")) language = "cpp";
  else if (langText.includes("javascript")) language = "javascript";

  return {
    platform: "geeksforgeeks",
    title,
    description,
    code: getCode(),
    language,
    difficulty,
    url: window.location.href,
  };
}
