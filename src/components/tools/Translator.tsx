import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Languages,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LanguageSelect } from "@/components/tools/LanguageSelect";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/locales/en";
import { AUTO_DETECT, MAX_CHARS, languageName, translateText } from "@/lib/tools/translate";
import { cn } from "@/lib/utils";

export function Translator() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [from, setFrom] = useState(AUTO_DETECT);
  const [to, setTo] = useState("es");
  const [detected, setDetected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const overLimit = input.length > MAX_CHARS;
  const label = (code: string) =>
    code === AUTO_DETECT ? t("translator.auto") : languageName(code);

  const handleTranslate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setErrorKey(null);
    setLoading(true);
    try {
      const result = await translateText({ text: input, from, to, signal: controller.signal });
      setOutput(result.text);
      setDetected(from === AUTO_DETECT ? result.detectedSource : null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setOutput("");
      setDetected(null);
      setErrorKey("translator.genericError");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [input, from, to]);

  const handleSwap = () => {
    const nextFrom = to;
    const nextTo = from === AUTO_DETECT ? (detected ?? "en") : from;
    setFrom(nextFrom);
    setTo(nextTo);
    setInput(output);
    setOutput(input);
    setDetected(null);
    setErrorKey(null);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setInput("");
    setOutput("");
    setErrorKey(null);
    setDetected(null);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setErrorKey("translator.copyError");
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-${to}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <LanguageSelect label={t("translator.from")} value={from} onChange={setFrom} includeAuto />
        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          aria-label={t("translator.swap")}
          className="shrink-0 rounded-xl sm:mb-0.5"
        >
          <ArrowLeftRight className="size-4" />
        </Button>
        <LanguageSelect label={t("translator.to")} value={to} onChange={setTo} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col rounded-2xl border border-border bg-background/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {label(from)}
            </span>
            <span
              className={cn(
                "text-xs tabular-nums",
                overLimit ? "font-medium text-destructive" : "text-muted-foreground",
              )}
              dir="ltr"
            >
              {input.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("translator.inputPlaceholder")}
            aria-label={t("translator.inputLabel")}
            className="min-h-56 w-full resize-y bg-transparent px-4 py-3.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="min-w-0 truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {label(to)}
              {detected && (
                <span className="ms-2 normal-case tracking-normal text-primary">
                  {t("translator.detected", { language: languageName(detected) })}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output}
                title="Download .txt"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Download className="size-3.5" />
                <span>Save .txt</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                {copied ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? t("translator.copied") : t("translator.copy")}
              </button>
            </div>
          </div>

          <div className="relative min-h-56 flex-1 px-4 py-3.5">
            {loading ? (
              <LoadingState />
            ) : output ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed animate-rise">{output}</p>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {errorKey && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-rise"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{t(errorKey)}</span>
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={!input && !output}
          className="rounded-xl text-muted-foreground"
        >
          <Trash2 className="size-4" />
          {t("translator.clear")}
        </Button>
        <Button
          onClick={handleTranslate}
          disabled={loading || !input.trim() || overLimit}
          size="lg"
          className="rounded-xl shadow-lift"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("translator.translating")}
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {t("translator.translate")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      {[100, 88, 94, 62].map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded-full bg-[linear-gradient(90deg,var(--muted),var(--border),var(--muted))] bg-[length:200%_100%] animate-shimmer"
          style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Languages className="size-5" />
      </span>
      <p className="text-sm font-medium">{t("translator.emptyTitle")}</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {t("translator.emptyBody")}
      </p>
    </div>
  );
}
