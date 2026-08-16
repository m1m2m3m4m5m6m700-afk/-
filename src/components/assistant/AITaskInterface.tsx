import { useEffect, useRef, useState } from "react";
import { Bot, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

const MAX_HISTORY = 20;

export function AITaskInterface() {
  const { t, locale } = useI18n();
  const storageKey = `flixo-flex-home:${locale}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHydrated(true);
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]") as Message[];
      setMessages(Array.isArray(stored) ? stored.slice(-MAX_HISTORY) : []);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {
      // Session storage can be unavailable in privacy-restricted browser contexts.
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, storageKey]);

  const newChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore storage failures; clearing in-memory state is still effective.
    }
    inputRef.current?.focus();
  };

  const send = async (preset?: string) => {
    if (!hydrated) return;
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((current) => [...current, userMessage].slice(-MAX_HISTORY));
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, history, locale }) });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) throw new Error(data.error || "Flex is temporarily unavailable.");
      const assistantMessage: Message = { id: `a-${Date.now()}`, role: "assistant", content: data.reply };
      setMessages((current) => [...current, assistantMessage].slice(-MAX_HISTORY));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Flex is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: React.FormEvent) => { event.preventDefault(); void send(); };
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } };
  const suggestions = [t("assistant.suggestion.translation"), t("assistant.suggestion.writing"), t("assistant.suggestion.utilities")];

  return (
    <section
      className="mx-auto w-full max-w-5xl"
      aria-label="Flex AI chat"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="flex-chat"
    >
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 shadow-lift backdrop-blur-xl">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/12 via-card to-card px-5 py-5 sm:px-7"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{t("assistant.eyebrow")}</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{t("hero.title")}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("hero.description")}</p></div></div><Button variant="ghost" size="icon" onClick={newChat} disabled={!hydrated} className="size-9 rounded-xl" title="New chat" data-testid="flex-new-chat"><Plus className="size-4" /></Button></div></div>
        <div className="min-h-60 max-h-[480px] overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center text-center"><div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Bot className="size-6" /></div><h2 className="mt-4 text-lg font-bold">{t("assistant.title")}</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("assistant.empty.body")}</p><div className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2">{suggestions.map((suggestion, index) => <button key={suggestion} type="button" disabled={!hydrated || loading} onClick={() => void send(suggestion)} data-testid={`flex-quick-prompt-${index}`} className="rounded-full border border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">{suggestion}</button>)}</div></div> : <div className="space-y-4">{messages.map((item) => <div key={item.id} className={cn("flex gap-3", item.role === "user" ? "justify-end" : "justify-start")}>{item.role === "assistant" && <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bot className="size-4" /></div>}<div dir="auto" className={cn("max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6", item.role === "user" ? "bg-primary text-primary-foreground" : "border border-border/70 bg-background text-foreground")}>{item.content}</div></div>)}{loading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Bot className="size-4 text-primary" /><span>{t("assistant.thinking")}</span><span className="animate-pulse">…</span></div>}<div ref={endRef} /></div>}
        </div>
        {error && <div className="mx-4 mb-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive sm:mx-6">{error}</div>}
        <form onSubmit={submit} className="border-t border-border/60 bg-background/70 p-3 sm:p-4"><div className="rounded-2xl border border-border/80 bg-card p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10"><Textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onKeyDown} rows={3} disabled={!hydrated || loading} data-testid="flex-composer" placeholder={t("hero.searchPlaceholder")} className="min-h-20 resize-none border-0 bg-transparent px-2 py-1.5 text-sm shadow-none focus-visible:ring-0" /><div className="flex items-center justify-between gap-2 px-1 pt-1"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Trash2 className="size-3.5" /><button type="button" onClick={newChat} disabled={!hydrated} className="hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">{t("assistant.reset")}</button></div><Button type="submit" disabled={!hydrated || !input.trim() || loading} data-testid="flex-send" className="rounded-xl px-4 font-bold"><Send className="me-2 size-4" />{t("assistant.button")}</Button></div></div></form>
      </div>
    </section>
  );
}
