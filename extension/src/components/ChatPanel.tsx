import { useState, useEffect, useRef, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSession } from "@/store/session";
import { useProblem } from "@/hooks/useProblem";
import { sendChatMessage, fetchDebug } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeOpeningMessage(title: string): ChatMessage {
  return {
    id: makeId(),
    role: "assistant",
    content: `Hey! I can see you're working on **${title}**. What have you tried so far? Walk me through your thinking.`,
    timestamp: Date.now(),
  };
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```(?:\w*)\n[\s\S]*?```)/g);
  return (
    <div className="space-y-1.5">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const firstNL = part.indexOf("\n");
          const lastFence = part.lastIndexOf("```");
          const code = firstNL !== -1 ? part.slice(firstNL + 1, lastFence) : part;
          return (
            <pre
              key={i}
              className="p-2 rounded-lg bg-black/40 text-[10px] text-emerald-300 overflow-x-auto font-mono border border-white/5 whitespace-pre"
            >
              {code}
            </pre>
          );
        }
        const paragraphs = part.split(/\n\n+/);
        return paragraphs
          .filter((p) => p.trim())
          .map((para, pi) => {
            const inlineLines = para.split("\n");
            return (
              <p key={`${i}-${pi}`} className="leading-relaxed">
                {inlineLines.map((line, li) => (
                  <span key={li}>
                    {line.split(/(\*\*[^*]+\*\*)/g).map((seg, si) =>
                      seg.startsWith("**") && seg.endsWith("**") ? (
                        <strong key={si} className="font-semibold">
                          {seg.slice(2, -2)}
                        </strong>
                      ) : (
                        seg
                      )
                    )}
                    {li < inlineLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            );
          });
      })}
    </div>
  );
}

export default function ChatPanel() {
  const { problemId, problem, attemptId, context, setSolved } = useSession(
    useShallow((s) => ({
      problemId: s.problemId,
      problem: s.problem,
      attemptId: s.attemptId,
      context: s.context,
      setSolved: s.setSolved,
    }))
  );
  const { getFreshCode } = useProblem();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeToAttach, setCodeToAttach] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from chrome.storage on problemId change
  useEffect(() => {
    if (!problemId || !problem) return;
    setMessages([]); // clear stale messages before loading
    chrome.storage.local.get(`chat_${problemId}`, (r) => {
      const saved = r[`chat_${problemId}`] as ChatMessage[] | undefined;
      if (saved?.length) {
        setMessages(saved);
      } else {
        const opening = makeOpeningMessage(problem.title);
        setMessages([opening]);
        chrome.storage.local.set({ [`chat_${problemId}`]: [opening] });
      }
    });
  }, [problemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  const saveMessages = useCallback(
    (msgs: ChatMessage[]) => {
      if (!problemId) return;
      chrome.storage.local.set({ [`chat_${problemId}`]: msgs });
    },
    [problemId]
  );

  const handleShareCode = async () => {
    const { code } = await getFreshCode();
    if (code) setCodeToAttach(code);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !codeToAttach) return;
    if (!problemId || isLoading) return;

    const lang = context?.language ?? "code";
    const content = codeToAttach
      ? `${trimmed ? trimmed + "\n\n" : ""}\`\`\`${lang}\n${codeToAttach}\n\`\`\``
      : trimmed;

    const userMsg: ChatMessage = { id: makeId(), role: "user", content, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setCodeToAttach(null);
    setIsLoading(true);

    try {
      const { reply } = await sendChatMessage(
        problemId,
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        attemptId ?? undefined
      );
      const aiMsg: ChatMessage = { id: makeId(), role: "assistant", content: reply, timestamp: Date.now() };
      const final = [...newMessages, aiMsg];
      setMessages(final);
      saveMessages(final);
    } catch {
      const errMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "Couldn't reach the server — check that the Next.js dev server is running.",
        timestamp: Date.now(),
      };
      const final = [...newMessages, errMsg];
      setMessages(final);
      saveMessages(final);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunTests = async () => {
    if (!problemId || isLoading) return;
    const { code, language } = await getFreshCode();
    if (!code) return;

    setIsLoading(true);
    try {
      const result = await fetchDebug(problemId, code, language, attemptId ?? undefined);
      if (result.allPassed) {
        setSolved();
        return;
      }
      const d = result.diagnosis;
      const text = d
        ? `Tests failed.\n\n${d.rootCause ? `**What I see:** ${d.rootCause}\n\n` : ""}${d.linesHint ? `**Look here:** ${d.linesHint}\n\n` : ""}What do you think is causing this?`
        : "Tests failed — what do you think might be wrong?";
      const aiMsg: ChatMessage = { id: makeId(), role: "assistant", content: text, timestamp: Date.now() };
      const updated = [...messages, aiMsg];
      setMessages(updated);
      saveMessages(updated);
    } catch {
      // silently ignore test run failures
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const codeLines = codeToAttach?.split("\n").length ?? 0;

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[12px] ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-[#1c1c28] text-[#d4d4e8] rounded-tl-sm border border-white/5"
              }`}
            >
              <MessageContent content={msg.content} />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1c1c28] rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-[#6b6b9a] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-[#6b6b9a] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-[#6b6b9a] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/8 px-3 pt-2 pb-3 space-y-2">
        {codeToAttach && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/25">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-violet-400 flex-shrink-0"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span className="text-[11px] text-violet-300 flex-1">Code attached ({codeLines} lines)</span>
            <button
              onClick={() => setCodeToAttach(null)}
              className="text-violet-400 hover:text-violet-300 text-xs leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, share your thinking... (Enter to send)"
          rows={2}
          className="w-full bg-[#13131f] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-[#d4d4e8] placeholder-[#4a4a6a] resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareCode}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-[11px] text-[#9898b8] hover:text-white transition-colors disabled:opacity-40"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Share code
          </button>

          <button
            onClick={handleRunTests}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-[11px] text-[#9898b8] hover:text-white transition-colors disabled:opacity-40"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Run tests
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !codeToAttach)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-[12px] text-white font-medium transition-colors"
          >
            {isLoading ? (
              <svg
                className="animate-spin w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
