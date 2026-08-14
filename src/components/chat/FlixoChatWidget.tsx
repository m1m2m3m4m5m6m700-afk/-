/**
 * FlixoChatWidget — a free chatbot powered by Gemini Free Tier.
 *
 * Floating chat button + conversation window, rendered inside SiteLayout so
 * it appears on every public page (not on the /developer or /admin routes,
 * which intentionally skip SiteLayout).
 *
 * Streaming: the widget calls the real same-origin HTTP endpoint
 * `POST /api/chat` (handled by the Nitro server entry in src/server.ts, which
 * proxies to the server-only handler in src/lib/ai/chat/handler.ts). The
 * endpoint returns a `text/event-stream` (SSE) of reply text deltas, so the
 * widget reads `response.body` and renders the answer token-by-token. When the
 * key is unset, the server returns a non-streaming JSON error the widget
 * surfaces as a message.
 *
 * Security: no API key, endpoint, or upstream payload is ever read by the
 * client — the Gemini call happens entirely server-side. Only the user's text
 * leaves the browser, to the same-origin `/api/chat` route (CSRF-protected by
 * the server's same-origin check). No `GEMINI_API_KEY` reaches the client.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** True while this assistant message is still streaming. */
  streaming?: boolean;
  /** A surfaced error message (rate limit / unavailable / not configured). */
  error?: boolean;
}

const MAX_INPUT_CHARS = 2000;
const MAX_TURNS = 20;

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Flixo's assistant. Ask me what Flixo can do, request a tool, or get a quick answer. How can I help?",
};

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function FlixoChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to the latest message / streaming token.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  // Abort any in-flight stream when the window closes.
  useEffect(() => {
    if (!isOpen) abortRef.current?.abort();
    return () => abortRef.current?.abort();
  }, [isOpen]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    if (text.length > MAX_INPUT_CHARS) return;

    // Keep the conversation bounded for the request (exclude surfaced errors).
    const history = messages
      .filter((m) => !m.error)
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content }));

    const userMsg: ChatMessage = { id: makeId(), role: "user", content: text };
    const assistantId = makeId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ message: text, history }),
      });

      // The endpoint returns either a streaming SSE Response or a JSON error.
      // A same-origin failure (403) means the request was rejected as CSRF.
      if (!res.ok && res.status !== 200) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    res.status === 403
                      ? "This request was blocked as cross-origin. Please use the chat on the Flixo site."
                      : "Could not reach the chatbot service. Please try again.",
                  streaming: false,
                  error: true,
                }
              : m,
          ),
        );
        return;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("text/event-stream")) {
        // Non-streaming error response (not configured / validation / upstream).
        let message = "Something went wrong. Please try again.";
        let retryable = true;
        try {
          const payload = (await res.json()) as { error?: string; retryable?: boolean };
          if (payload.error) message = payload.error;
          if (payload.retryable === false) retryable = false;
        } catch {
          /* keep default */
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: message, streaming: false, error: !retryable ? true : m.error }
              : m,
          ),
        );
        return;
      }

      const reader = (res.body as ReadableStream<Uint8Array>).getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          const lines = frame.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          const eventName = eventLine?.slice("event:".length).trim();
          const dataText = dataLine?.slice("data:".length).trim();

          if (eventName === "error") {
            let message = "The AI provider returned an error.";
            let retryable = true;
            try {
              const payload = JSON.parse(dataText ?? "{}") as {
                error?: string;
                retryable?: boolean;
              };
              if (payload.error) message = payload.error;
              if (payload.retryable === false) retryable = false;
            } catch {
              /* keep defaults */
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: m.content ? m.content + message : message,
                      streaming: false,
                      error: m.content ? m.error : !retryable ? true : m.error,
                    }
                  : m,
              ),
            );
            return;
          }

          if (eventName === "done") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      streaming: false,
                      content:
                        m.content || "Sorry, I couldn't generate a response. Please try again.",
                    }
                  : m,
              ),
            );
            return;
          }

          if (dataText) {
            try {
              const delta = JSON.parse(dataText) as string;
              if (delta) {
                received = true;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + delta } : m,
                  ),
                );
              }
            } catch {
              /* ignore malformed delta */
            }
          }
        }
      }

      // Stream ended without an explicit `done` event.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                streaming: false,
                content:
                  m.content ||
                  (received ? "" : "Sorry, I couldn't generate a response. Please try again."),
              }
            : m,
        ),
      );
    } catch (err) {
      if (controller.signal.aborted) {
        // User closed the window / navigated away — drop the partial message.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Could not reach the chatbot service. Please try again.",
                  streaming: false,
                  error: false,
                }
              : m,
          ),
        );
      }
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  }, [input, isSending, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send();
      }
    },
    [send],
  );

  const tooLong = input.length > MAX_INPUT_CHARS;

  return (
    <>
      {/* Floating launcher button */}
      <motion.button
        type="button"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
          "transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "max-md:bottom-4 max-md:right-4",
        )}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl",
              "bottom-24 right-5 w-[min(92vw,26rem)] max-md:bottom-24 max-md:right-3",
              "h-[min(70vh,34rem)]",
            )}
            role="dialog"
            aria-label="Flixo chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-foreground">
                  Flixo Assistant
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Powered by Gemini · Free Tier
                </p>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-card px-3 py-3">
              <div className="relative flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Flixo anything…"
                  maxLength={MAX_INPUT_CHARS + 200}
                  className={cn(
                    "max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                />
                <button
                  type="button"
                  aria-label="Send message"
                  disabled={isSending || !input.trim() || tooLong}
                  onClick={() => void send()}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    "bg-primary text-primary-foreground shadow-sm transition-colors",
                    "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between px-1">
                <span className="text-[11px] text-muted-foreground">
                  Enter to send · Shift+Enter for a new line
                </span>
                <span
                  className={cn(
                    "text-[11px]",
                    tooLong ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {input.length}/{MAX_INPUT_CHARS}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isError = Boolean(message.error);
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : isError
              ? "rounded-bl-md border border-destructive/40 bg-destructive/10 text-foreground"
              : "rounded-bl-md bg-secondary text-secondary-foreground",
        )}
      >
        {isError ? (
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>{message.content}</span>
          </span>
        ) : message.content ? (
          message.content
        ) : message.streaming ? (
          <span className="inline-flex items-center gap-1 py-0.5" aria-label="Assistant is typing">
            <Dot delay={0} />
            <Dot delay={160} />
            <Dot delay={320} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
    />
  );
}
