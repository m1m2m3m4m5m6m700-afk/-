import { useState, useRef, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import {
  Sparkles,
  Paperclip,
  Link as LinkIcon,
  Mic,
  CornerDownLeft,
  X,
  FileText,
  Globe,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Bot,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { BrainStatus } from "@/lib/brain";

const EXAMPLE_PROMPTS = [
  "Remove watermark from this image",
  "Compress this PDF",
  "Download this YouTube video",
  "Generate a logo",
  "Translate this document",
  "Upscale this image",
  "Convert MP4 to MP3",
  "Extract text from image",
  "Summarize this website",
  "Generate source code",
];

interface FlexMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIPromptBoxProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (
    prompt: string,
    attachment?: { file?: File; name?: string; type?: string },
    link?: string,
  ) => void;
  status: BrainStatus;
  statusText: string;
  loading: boolean;
}

const MAX_FLEX_HISTORY = 12;

function appendFlexMessage(messages: FlexMessage[], message: FlexMessage): FlexMessage[] {
  return [...messages, message].slice(-MAX_FLEX_HISTORY);
}

export function AIPromptBox({
  prompt,
  onPromptChange,
  onSubmit,
  status,
  statusText,
  loading,
}: AIPromptBoxProps) {
  const { t, locale } = useI18n();
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [pastedLink, setPastedLink] = useState<string>("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState<boolean>(false);
  const [tempLink, setTempLink] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [flexMessages, setFlexMessages] = useState<FlexMessage[]>([]);
  const [flexLoading, setFlexLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleAddLink = () => {
    if (tempLink.trim()) {
      setPastedLink(tempLink.trim());
      setLinkPopoverOpen(false);
      setTempLink("");
    }
  };

  const handleTriggerSubmit = () => {
    if (!prompt.trim() && !attachedFile && !pastedLink) return;
    onSubmit(
      prompt,
      attachedFile
        ? { file: attachedFile, name: attachedFile.name, type: attachedFile.type }
        : undefined,
      pastedLink || undefined,
    );
  };

  const handleAskFlex = async () => {
    const text = prompt.trim();
    if (!text || flexLoading) return;

    const nextMessages = appendFlexMessage(flexMessages, { role: "user", content: text });
    setFlexMessages(nextMessages);
    setFlexLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1),
        }),
      });

      const payload = (await response.json()) as { reply?: string; error?: string };
      const reply =
        payload.reply?.trim() ||
        payload.error ||
        (locale === "ar" ? "لم يتمكن Flex من الإجابة الآن." : "Flex could not answer right now.");

      setFlexMessages((current) => appendFlexMessage(current, { role: "assistant", content: reply }));
    } catch {
      setFlexMessages((current) =>
        appendFlexMessage(current, {
          role: "assistant",
          content:
            locale === "ar"
              ? "تعذر الاتصال بخدمة Flex حاليًا."
              : "Flex could not reach the AI service right now.",
        }),
      );
    } finally {
      setFlexLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTriggerSubmit();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFile(file);
      setPastedLink("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <AnimatePresence mode="wait">
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-4 py-1.5 text-xs font-semibold shadow-xs backdrop-blur-xl">
              {status === "thinking" || status === "analyzing" || status === "matching" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span className="text-primary">{statusText}</span>
                </>
              ) : status === "ready" ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">{statusText}</span>
                </>
              ) : status === "unknown" ? (
                <>
                  <HelpCircle className="size-3.5 text-amber-500" />
                  <span className="text-amber-500 font-bold">{statusText}</span>
                </>
              ) : (
                <span className="text-muted-foreground">{statusText}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative rounded-3xl border bg-card/80 p-3 shadow-lift backdrop-blur-xl transition-all duration-300 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 ${
          isDragging ? "border-primary/60 bg-primary/10" : "border-border/80"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {(attachedFile || pastedLink) && (
          <div className="flex flex-wrap items-center gap-2 px-3 pt-1 pb-2 border-b border-border/50">
            {attachedFile && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
                <FileText className="size-3.5" />
                <span className="max-w-[150px] truncate">{attachedFile.name}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="ms-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {pastedLink && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-500">
                <Globe className="size-3.5" />
                <span className="max-w-[150px] truncate">{pastedLink}</span>
                <button
                  onClick={() => setPastedLink("")}
                  className="ms-1 rounded-full p-0.5 hover:bg-purple-500/20 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {flexMessages.length > 0 && (
          <div className="mb-2 max-h-48 space-y-2 overflow-y-auto border-b border-border/40 px-3 py-2">
            {flexMessages.slice(-4).map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                className={
                  message.role === "user"
                    ? "ms-8 rounded-2xl bg-primary/10 px-3 py-2 text-xs text-foreground"
                    : "me-8 rounded-2xl border border-primary/10 bg-background/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
                }
              >
                <div className="mb-1 flex items-center gap-1.5 font-bold text-foreground">
                  {message.role === "assistant" ? <Bot className="size-3.5 text-primary" /> : null}
                  {message.role === "assistant" ? "Flex" : locale === "ar" ? "أنت" : "You"}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
          </div>
        )}

        <div className="px-2 pt-2">
          <label htmlFor="ai-task-input" className="sr-only">
            {t("brain.input.label")}
          </label>
          <textarea
            id="ai-task-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("brain.input.placeholder")}
            rows={3}
            className="w-full resize-none bg-transparent px-2 py-1 text-base md:text-lg outline-none placeholder:text-muted-foreground/60 font-sans"
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_PROMPTS.slice(0, 6).map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                onPromptChange(example);
              }}
              className="rounded-2xl border border-border/70 bg-surface/80 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 px-1">
          <div className="flex flex-wrap items-center gap-1">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    <Paperclip className="me-1.5 size-4 text-primary" />
                    <span>{t("brain.input.upload")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("brain.input.uploadHint")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    <FileText className="me-1.5 size-4 text-primary" />
                    <span>{t("brain.input.dragDrop")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("brain.input.dragDropHint")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <LinkIcon className="me-1.5 size-4 text-purple-500" />
                  <span>{t("brain.input.pasteLink")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl p-3 shadow-lg" align="start">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">{t("brain.input.linkTitle")}</h4>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="https://example.com/file"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      className="text-xs rounded-xl h-8 bg-surface"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddLink}
                      className="rounded-xl h-8 text-xs font-bold"
                    >
                      {t("brain.input.linkAdd")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled
                    className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground/50 opacity-60 cursor-not-allowed"
                  >
                    <Mic className="me-1.5 size-4" />
                    <span>{t("brain.input.voice")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("brain.input.voiceHint")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleAskFlex()}
              disabled={flexLoading || !prompt.trim()}
              className="rounded-2xl border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10"
              aria-label="Ask Flex"
            >
              {flexLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span>{locale === "ar" ? "اسأل Flex" : "Ask Flex"}</span>
            </Button>

            <Button
              type="button"
              onClick={handleTriggerSubmit}
              disabled={loading || (!prompt.trim() && !attachedFile && !pastedLink)}
              className="rounded-2xl px-4 py-2 text-xs font-bold shadow-sm transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-4 animate-spin" />
                  <span>{t("brain.input.processing")}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-4" />
                  <span>{t("brain.input.execute")}</span>
                  <CornerDownLeft className="size-3 opacity-70 ms-1 hidden sm:inline" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
