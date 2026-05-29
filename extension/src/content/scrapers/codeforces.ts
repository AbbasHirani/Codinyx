import type { ScrapedContext } from "@/lib/types";

export function scrapeCodeforces(): ScrapedContext | null {
  const title = (
    document.querySelector<HTMLElement>(".problem-statement .header .title") ||
    document.querySelector<HTMLElement>(".title")
  )?.innerText?.trim();

  const stmtEl = document.querySelector<HTMLElement>(".problem-statement");
  let description = "";
  if (stmtEl) {
    // Clone and remove the header section (time/memory limits etc.)
    const clone = stmtEl.cloneNode(true) as HTMLElement;
    clone.querySelector(".header")?.remove();
    description = clone.innerText.trim();
  }

  if (!title || !description) return null;

  // Codeforces uses a plain textarea for submission
  const codeEl = document.querySelector<HTMLTextAreaElement>("#sourceCodeTextarea") ||
    document.querySelector<HTMLTextAreaElement>("textarea[name='sourceCode']");
  const code = codeEl?.value?.trim() || "";

  const langEl = document.querySelector<HTMLSelectElement>("#programTypeForSubmit") ||
    document.querySelector<HTMLSelectElement>("[name='programTypeId']");
  const langText = langEl?.options[langEl.selectedIndex]?.text?.toLowerCase() || "";
  let language = "cpp";
  if (langText.includes("python")) language = "python";
  else if (langText.includes("java")) language = "java";
  else if (langText.includes("javascript") || langText.includes("node")) language = "javascript";
  else if (langText.includes("go")) language = "go";

  return {
    platform: "codeforces",
    title,
    description,
    code,
    language,
    url: window.location.href,
  };
}
