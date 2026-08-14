import { useMemo, useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { useAIGeneration } from "@/lib/ai/useAIGeneration";
import type { AITaskId } from "@/lib/ai/types";

const TASKS: Array<{ id: AITaskId; label: string; hint: string }> = [
  { id: "ai-chat", label: "AI Chat", hint: "Ask, explain, brainstorm or plan." },
  { id: "ai-writer", label: "AI Writer", hint: "Create polished original content." },
  { id: "summarizer", label: "Summarizer", hint: "Turn long text into key points." },
  { id: "rewrite-text", label: "Rewrite", hint: "Improve clarity without changing meaning." },
  { id: "grammar-checker", label: "Grammar", hint: "Correct spelling, grammar and punctuation." },
  { id: "translator", label: "Translator", hint: "Translate while preserving tone and formatting." },
  { id: "article-generator", label: "Article", hint: "Generate a structured long-form article." },
  { id: "blog-generator", label: "SEO Blog", hint: "Create an SEO-friendly blog post." },
  { id: "code-assistant", label: "Code Assistant", hint: "Explain, debug, refactor or generate code." },
  { id: "research-assistant", label: "Research", hint: "Structure research without fabricated sources." },
];

export function FreeAIHub() {
  const [taskId, setTaskId] = useState<AITaskId>("ai-chat");
  const [input, setInput] = useState("");
  const ai = useAIGeneration(taskId);
  const task = useMemo(() => TASKS.find((item) => item.id === taskId) ?? TASKS[0], [taskId]);

  const submit = async () => {
    await ai.run(input);
  };

  const copy = async () => {
    if (ai.content) await navigator.clipboard.writeText(ai.content);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Free-first AI</h2>
            <p className="text-sm text-muted-foreground">{task.hint} Flixo uses the configured free/local provider path first.</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TASKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTaskId(item.id);
                ai.clear();
              }}
              className={`rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${
                item.id === taskId
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 bg-background/50 text-foreground hover:border-primary/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <label htmlFor="free-ai-input" className="mb-2 block text-sm font-semibold text-foreground">
          {task.label}
        </label>
        <textarea
          id="free-ai-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") void submit();
          }}
          placeholder={task.hint}
          rows={10}
          className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
          maxLength={12000}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Ctrl/Cmd + Enter to run · {input.length}/12000</span>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={ai.loading || !input.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ai.loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {ai.loading ? "Thinking…" : "Run AI"}
          </button>
        </div>
      </div>

      {ai.result && (
        <div className="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm">
          {ai.result.ok ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">Result</p>
                  <p className="text-xs text-muted-foreground">{ai.result.provider} · {ai.result.model}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Copy className="size-3.5" /> Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-2xl bg-background p-4 text-sm leading-7 text-foreground">
                {ai.content}
              </pre>
            </>
          ) : (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {ai.result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
