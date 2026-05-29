import type { ScrapedContext, ExtensionMessage } from "@/lib/types";
import { scrapeLeetCode, watchForAccepted } from "./scrapers/leetcode";
import { scrapeHackerRank } from "./scrapers/hackerrank";
import { scrapeCodeforces } from "./scrapers/codeforces";
import { scrapeGeeksForGeeks } from "./scrapers/geeksforgeeks";
import { debounce } from "./utils";

function detectPlatform(): string {
  const host = window.location.hostname;
  if (host.includes("leetcode")) return "leetcode";
  if (host.includes("hackerrank")) return "hackerrank";
  if (host.includes("codeforces")) return "codeforces";
  if (host.includes("geeksforgeeks")) return "geeksforgeeks";
  return "unknown";
}

function scrape(): ScrapedContext | null {
  const platform = detectPlatform();
  if (platform === "leetcode") return scrapeLeetCode();
  if (platform === "hackerrank") return scrapeHackerRank();
  if (platform === "codeforces") return scrapeCodeforces();
  if (platform === "geeksforgeeks") return scrapeGeeksForGeeks();
  return null;
}

function broadcast(ctx: ScrapedContext) {
  chrome.runtime.sendMessage({ type: "CONTEXT_UPDATE", payload: ctx } as ExtensionMessage);
}

// Initial scrape after DOM settles
setTimeout(() => {
  const ctx = scrape();
  if (ctx) broadcast(ctx);
}, 2000);

// Watch for LeetCode "Accepted" submission banner
if (detectPlatform() === "leetcode") {
  watchForAccepted(() => {
    chrome.runtime.sendMessage({ type: "SUBMISSION_ACCEPTED" } as ExtensionMessage);
  });
}

// Re-scrape on SPA navigation (title change)
const debouncedRescrape = debounce(() => {
  const ctx = scrape();
  if (ctx) broadcast(ctx);
}, 1500);

new MutationObserver(debouncedRescrape).observe(
  document.querySelector("title") ?? document.head,
  { childList: true, subtree: true, characterData: true }
);

// Listen for on-demand requests from the side panel
chrome.runtime.onMessage.addListener(
  (msg: ExtensionMessage, _sender, sendResponse) => {
    if (msg.type === "GET_CODE") {
      const ctx = scrape();
      sendResponse({ code: ctx?.code ?? "", language: ctx?.language ?? "python" });
      return true;
    }
    if (msg.type === "GET_CONTEXT") {
      sendResponse(scrape());
      return true;
    }
  }
);
