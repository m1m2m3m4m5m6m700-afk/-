import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { MessageSquare, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; content: string };
const STORAGE_KEY = "flixo-flex-chat";
const MAX_HISTORY = 20;
const WELCOME: ChatMessage = { id: "welcome", role: "assistant", content: "Hi! I’m Flex, Flixo’s AI assistant. Tell me what you want to do and I’ll help you find the right tool." };

function loadHistory(key: string): ChatMessage[] {
  if (typeof window === "undefined") return [WELCOME];
  try {
    const value = JSON.parse(window.sessionStorage.getItem(key) ?? "null") as ChatMessage[] | null;
    return Array.isArray(value) && value.length ? value.slice(-MAX_HISTORY) : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

export function VisitorChatWidget() {
  const { locale } = useI18n();
  const storageKey = `${STORAGE_KEY}:${locale}`;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory(storageKey));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, storageKey, open]);

  useEffect(() => {
    if (open && !loading) inputRef.current?.focus();
  }, [open, loading]);

  const resetChat = () => {
    setMessages([WELCOME]);
    setInput("");
    setError(null);
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
    inputRef.current?.focus();
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: text }].slice(-MAX_HISTORY));
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
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", content: data.reply! }].slice(-MAX_HISTORY));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The chat service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section role="dialog" aria-label="Flex chat" className="mb-3 flex h-[min(700px,calc(100vh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div><h2 className="text-sm font-bold">Flex</h2><p className="text-[11px] text-muted-foreground">AI Chat · {locale}</p></div>
            <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={resetChat} title="New chat" className="size-8"><Plus className="size-4" /></Button><Button variant="ghost" size="icon" onClick={() => setOpen(false)} title="Close chat" className="size-8"><X className="size-4" /></Button></div>
          </header>
          <div className="flex-1 overflow-y-auto p-4"><div className="space-y-3">{messages.map((item) => <div key={item.id} className={item.role === "user" ? "flex justify-end" : "flex justify-start"}><div dir="auto" className={item.role === "user" ? "max-w-[84%] rounded-2xl bg-primary px-3.5 py-2.5 text-sm text-primary-foreground" : "max-w-[84%] rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm"}>{item.content}</div></div>)}{loading && <div className="text-xs text-muted-foreground">Flex is thinking…</div>}{error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">{error}<button type="button" className="ms-2 underline" onClick={() => void sendMessage()}>Retry</button></div>}<div ref={endRef} /></div></div>
          <form onSubmit={submit} className="border-t border-border p-3"><Textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} disabled={loading} rows={2} placeholder="Ask Flex anything about Flixo…" className="resize-none" /><div className="mt-2 flex justify-end"><Button type="submit" disabled={!input.trim() || loading} size="icon" title="Send message"><Send className="size-4" /></Button></div></form>
        </section>
      )}
      <Button onClick={() => setOpen((value) => !value)} className="size-14 rounded-full p-0 shadow-xl" aria-label={open ? "Close Flex chat" : "Open Flex chat"}><MessageSquare className="size-6" /></Button>
    </div>
  );
}
