import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, Bot, MessageSquare, Plus, Send, Sparkles, User, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; content: string };

type ChatResponse = {
  reply?: string;
  error?: string;
};

const STORAGE_KEY = "flixo-flex-chat";
const MAX_HISTORY = 20;
const QUICK_PROMPTS = [
  "What can Flixo do?",
  "Help me choose a tool",
  "How do I remove an image background?",
  "Suggest a PDF tool",
];
const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m Flex, Flixo’s AI assistant. Tell me what you want to do and I’ll help you find the right tool or explain the next step.",
};

function createMessage(role: Role, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function loadHistory(storageKey: string): ChatMessage[] {
  if (typeof window === "undefined") return [WELCOME];

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "null") as ChatMessage[] | null;
    const valid = Array.isArray(stored)
      ? stored.filter(
          (item): item is ChatMessage =>
            Boolean(item) &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string" &&
            item.content.trim().length > 0,
        )
      : [];

    return valid.length > 0 ? valid.slice(-MAX_HISTORY) : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function VisitorChatWidget() {
  const { locale } = useI18n();
  const storageKey = `${STORAGE_KEY}:${locale}`;

  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    skipNextPersistRef.current = true;
    setMessages(loadHistory(storageKey));
    setInput("");
    setError(null);
    setLoading(false);
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {
      // Persistence is best-effort.
    }
  }, [hydrated, messages, storageKey]);

  useEffect(() => {
    if (detailsRef.current?.open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (hydrated && detailsRef.current?.open && !loading) {
      inputRef.current?.focus();
    }
  }, [hydrated, loading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const closeChat = () => {
    detailsRef.current?.removeAttribute("open");
  };

  const resetChat = () => {
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([WELCOME]);
    setInput("");
    setError(null);
    setLoading(false);
    skipNextPersistRef.current = false;

    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Persistence is best-effort.
    }
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!hydrated || !text || loading) return;

    const requestId = ++requestIdRef.current;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const history = messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, createMessage("user", text)].slice(-MAX_HISTORY));
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history, locale }),
        signal: controller.signal,
      });

      let data: ChatResponse = {};
      try {
        data = (await response.json()) as ChatResponse;
      } catch {
        data = { error: "Flex returned an invalid response." };
      }

      if (!response.ok || !data.reply?.trim()) {
        throw new Error(data.error || "Flex could not respond right now.");
      }

      if (requestId !== requestIdRef.current) return;

      setMessages((current) => [...current, createMessage("assistant", data.reply!.trim())].slice(-MAX_HISTORY));
    } catch (err) {
      if (isAbortError(err) || requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "The chat service is temporarily unavailable.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const onToggle = () => {
    if (detailsRef.current?.open && hydrated && !loading) {
      inputRef.current?.focus();
    }
  };

  return (
    <details
      ref={detailsRef}
      onToggle={onToggle}
      className="fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2rem)]"
    >
      <summary
        aria-label="Open Flex chat"
        aria-controls="flixo-flex-chat-panel"
        className="grid size-14 cursor-pointer list-none place-items-center rounded-full border border-primary/20 bg-primary p-0 text-primary-foreground shadow-xl transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
      >
        <span className="sr-only">Open Flex chat</span>
        <MessageSquare className="size-6" aria-hidden="true" />
      </summary>

      <div id="flixo-flex-chat-panel" className="absolute bottom-[4.5rem] right-0 w-[min(420px,calc(100vw-2rem))]">
        <section
          aria-label="Flex chat"
          className="flex h-[min(700px,calc(100vh-7rem))] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-card to-primary/5 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-foreground">Flex</h3>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[9px] text-emerald-500">
                    AI Chat
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Interactive Flixo assistant · {locale}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetChat}
                disabled={!hydrated || loading}
                className="size-8 rounded-full"
                title="New chat"
                aria-label="New chat"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeChat}
                className="size-8 rounded-full"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-surface/20 px-3.5 py-4 sm:px-4">
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={cn("flex items-end gap-2", item.role === "user" ? "justify-end" : "justify-start")}
                >
                  {item.role === "assistant" && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-3.5" />
                    </div>
                  )}

                  <div
                    dir="auto"
                    className={cn(
                      "max-w-[84%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      item.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border border-border/70 bg-card text-foreground shadow-xs",
                    )}
                  >
                    {item.content}
                  </div>

                  {item.role === "user" && (
                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                      <User className="size-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {!hydrated && (
                <div className="rounded-2xl border border-border/70 bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
                  Preparing Flex…
                </div>
              )}

              {loading && (
                <div className="flex items-end gap-2">
                  <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-1" aria-label="Flex is responding">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive" role="alert">
                  {error}
                  <button
                    type="button"
                    className="ms-2 font-semibold underline underline-offset-2"
                    disabled={!hydrated || loading}
                    onClick={() => void sendMessage()}
                  >
                    Retry
                  </button>
                </div>
              )}

              {messages.length === 1 && hydrated && !loading && (
                <div className="space-y-2 pt-1">
                  <p className="px-1 text-[11px] font-medium text-muted-foreground">Try asking Flex:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={!hydrated || loading}
                        onClick={() => void sendMessage(prompt)}
                        className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-border/60 bg-card/90 p-3">
            <div className="mb-2 flex items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground">
              <span>Enter to send · Shift+Enter for a new line</span>
              <Link to="/contact" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                Talk to owner <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-border/80 bg-background p-2 transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
            >
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                disabled={!hydrated || loading}
                placeholder="Ask Flex anything about Flixo…"
                className="min-h-12 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center justify-between gap-2 px-1 pt-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                  <span>Private session</span>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!hydrated || !input.trim() || loading}
                  className="size-9 rounded-xl"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </details>
  );
}
