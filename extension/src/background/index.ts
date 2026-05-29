import type { ScrapedContext, ExtensionMessage } from "@/lib/types";

let latestTabId: number | null = null;

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const supported =
    tab.url.includes("leetcode.com/problems") ||
    tab.url.includes("leetcode.com/contest") ||
    tab.url.includes("hackerrank.com/challenges") ||
    tab.url.includes("codeforces.com/problemset") ||
    tab.url.includes("codeforces.com/contest") ||
    tab.url.includes("geeksforgeeks.org/problems") ||
    tab.url.includes("practice.geeksforgeeks.org/problems");

  chrome.sidePanel.setOptions({ tabId, enabled: supported });
});

function notifySidePanel(msg: ExtensionMessage) {
  chrome.runtime.sendMessage(msg).catch(() => {/* panel not open — ignore */});
}

chrome.runtime.onMessage.addListener(
  (msg: ExtensionMessage, sender, sendResponse) => {
    if (msg.type === "CONTEXT_UPDATE" && msg.payload) {
      const ctx = msg.payload as ScrapedContext;
      latestTabId = sender.tab?.id ?? null;
      chrome.storage.session.set({ latestContext: ctx, latestTabId });
      notifySidePanel({ type: "PROBLEM_CHANGED" });
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === "SUBMISSION_ACCEPTED") {
      notifySidePanel({ type: "SUBMISSION_ACCEPTED" });
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === "GET_CONTEXT") {
      chrome.storage.session.get(["latestContext"], (r) => {
        sendResponse(r.latestContext ?? null);
      });
      return true;
    }

    if (msg.type === "GET_CODE") {
      chrome.storage.session.get(["latestTabId"], (r) => {
        const tabId = r.latestTabId ?? latestTabId;
        if (tabId !== null) {
          chrome.tabs.sendMessage(
            tabId,
            { type: "GET_CODE" } as ExtensionMessage,
            (response) => sendResponse(response ?? { code: "", language: "python" })
          );
        } else {
          sendResponse({ code: "", language: "python" });
        }
      });
      return true;
    }
  }
);
