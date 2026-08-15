import { useCallback, useMemo, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface FlexMessage {
  role: "user" | "assistant";
  content: string;
}

interface FlexChatBarProps {
  prompt: string;
}

const MAX_HISTORY = 12;

function appendMessage(messages: FlexMessage[], message: FlexMessage): FlexMessage[] {
  return [...messages, message].slice(-MAX_HISTORY);
}

export function FlexChatBar({ prompt }: FlexChatBarProps) {
  const { locale } = useI18n();
  const [messages, setMessages] = useState<FlexMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const copy = useMemo(() => {
    if (locale === "ar") {
      return {
        title: "Flex",
        hint: "اسأل Flex قبل تنفيذ المهمة — يختار لك أفضل طريقة ويشرحها.",
        ask: "اسأل Flex",
        thinking: "Flex يفكر...",
      };
    }
    return {
      title: "Flex",
      hint: "Ask Flex before running the task — it can suggest the best approach.",
      ask: "Ask Flex",
      thinking: "Flex is thinking...",
    };
  }, [locale]);

  const askFlex = useCallback(async () => {
    const text = prompt.trim();
    if (!text || loading) return;

    const nextMessages = appendMessage(messages, { role: "user", content: text });
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages.slice(0, -1) }),
      });

      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      const reply = payload.reply?.trim() || payload.error || "Flex could not answer right now.";
      setMessages((current) => appendMessage(current, { role: "assistant", content: reply }));
    } catch {
      setMessages((current) =>
        appendMessage(current, {
          role: "assistant",
          content: "Flex could not reach the AI service right now.",
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [loading, messages, prompt]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 border-b border-primary/10 px-3 py-2">
        <span className="grid size-7 place-items-center rounded-lg bg-primary/15 text-primary">
          <Bot className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground">{copy.title}</p>
          <p className="truncate text-[10px] text-muted-foreground">{copy.hint}</p>
        </div>
        <button
          type="button"
          onClick={() => void askFlex()}
          disabled={loading || !prompt.trim()}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold",
            "bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          {loading ? copy.thinking : copy.ask}
        </button>
      </div>

      {messages.length > 0 && (
        <div className="max-h-44 space-y-2 overflow-y-auto px-3 py-2.5">
          {messages.slice(-4).map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
              className={cn(
                "rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                message.role === "user"
                  ? "ms-6 bg-card text-foreground"
                  : "me-6 border border-primary/10 bg-background/70 text-muted-foreground",
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
