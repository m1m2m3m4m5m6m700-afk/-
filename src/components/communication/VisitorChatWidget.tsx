import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Bot, ChevronDown, MessageSquare, Plus, Send, Sparkles, User, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; content: string };

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

function message(role: Role, content: string): ChatMessage {
  return { id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content };
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
    return valid.length ? valid.slice(-MAX_HISTORY) : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

export function VisitorChatWidget() {
  const { locale } = useI18n();
  const storageKey = `${STORAGE_KEY}:${locale}`;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(storageKey));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadHistory(storageKey));
    setInput("");
    setError(null);
    setLoading(false);
  }, [storageKey]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {
      // Persistence is best-effort.
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open && !loading) inputRef.current?.focus();
  }, [open, loading]);

  const closeChat = () => {
    if (detailsRef.current) detailsRef.current.open = false;
    setOpen(false);
  };

  const resetChat = () => {
    setMessages([WELCOME]);
    setInput("");
    setError(null);
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Persistence is best-effort.
    }
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;

    const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, message("user", text)].slice(-MAX_HISTORY));
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history, locale }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || "Flex could not respond right now.");
      setMessages((current) => [...current, message("assistant", data.reply ?? "")].slice(-MAX_HISTORY));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The chat service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <details
      ref={detailsRef}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="fixed bottom-5 right-5 z-50"
    >
      <motion.div
        className="mb-3 flex h-[min(700px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl"
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
            <Button variant="ghost" size="icon" onClick={resetChat} className="size-8 rounded-full" title="New chat">
              <Plus className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={closeChat} className="size-8 rounded-full" title="Close chat">
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-surface/20 px-3.5 py-4 sm:px-4">
          <div className="space-y-4">
            {messages.map((item) => (
              <div key={item.id} className={cn("flex items-end gap-2", item.role === "user" ? "justify-end" : "justify-start")}>
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

            {loading && (
              <div className="flex items-end gap-2">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1">
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
                <button type="button" className="ms-2 font-semibold underline underline-offset-2" onClick={() => void sendMessage()}>
                  Retry
                </button>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-[11px] font-medium text-muted-foreground">Try asking Flex:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
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
          <form onSubmit={submit} className="rounded-2xl border border-border/80 bg-background p-2 transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              disabled={loading}
              placeholder="Ask Flex anything about Flixo…"
              className="min-h-12 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 px-1 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><MessageSquare className="size-3.5" /><span>Private session</span></div>
              <Button type="submit" size="icon" disabled={!input.trim() || loading} className="size-9 rounded-xl" title="Send message">
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      <summary
        className="group grid size-14 cursor-pointer list-none place-items-center rounded-full border border-primary/20 bg-primary p-0 text-primary-foreground shadow-xl transition hover:bg-primary/90 [&::-webkit-details-marker]:hidden"
        aria-label={open ? "Close Flex chat" : "Open Flex chat"}
      >
        {open ? <ChevronDown className="size-5" /> : <MessageSquare className="size-6 transition-transform group-hover:scale-105" />}
      </summary>
    </details>
  );
}
