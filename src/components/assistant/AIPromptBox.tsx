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
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
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

export function AIPromptBox({
  prompt,
  onPromptChange,
  onSubmit,
  status,
  statusText,
  loading,
}: AIPromptBoxProps) {
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [pastedLink, setPastedLink] = useState<string>("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState<boolean>(false);
  const [tempLink, setTempLink] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

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
      {/* Animated AI Status Badge */}
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

      {/* Main Container */}
      <div
        className={`relative rounded-3xl border bg-card/80 p-3 shadow-lift backdrop-blur-xl transition-all duration-300 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 ${
          isDragging ? "border-primary/60 bg-primary/10" : "border-border/80"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Attachment Chips Bar */}
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

        {/* Textarea Input */}
        <div className="px-2 pt-2">
          <label htmlFor="ai-task-input" className="sr-only">
            Describe your task
          </label>
          <textarea
            id="ai-task-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you need — Flixo picks the right tool for your files, text, images, videos or documents."
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
                handleTriggerSubmit();
              }}
              className="rounded-2xl border border-border/70 bg-surface/80 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:bg-card"
            >
              {example}
            </button>
          ))}
        </div>

        {/* Control Bar inside input */}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2 px-1">
          <div className="flex items-center gap-1">
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

            {/* Upload File Button */}
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
                    <span>Upload File</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach PDF, image, video, audio or document</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Drag / Drop hint */}
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
                    <span>Drag & Drop</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Drop a file anywhere on the card to attach it</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Paste Link Button */}
            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <LinkIcon className="me-1.5 size-4 text-purple-500" />
                  <span>Paste Link</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-2xl p-3 shadow-lg" align="start">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Paste Web URL / Asset Link</h4>
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
                      Add
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Voice Button (Disabled placeholder) */}
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
                    <span>Voice</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice input coming soon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Submit Action */}
          <Button
            type="button"
            onClick={handleTriggerSubmit}
            disabled={loading || (!prompt.trim() && !attachedFile && !pastedLink)}
            className="rounded-2xl px-4 py-2 text-xs font-bold shadow-sm transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                <span>Processing</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-4" />
                <span>Execute Task</span>
                <CornerDownLeft className="size-3 opacity-70 ms-1 hidden sm:inline" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
