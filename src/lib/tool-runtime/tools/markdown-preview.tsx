import { useState } from "react";
import { FileCode, Copy, Check, Download, Eye, Edit3 } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";
import { renderMarkdownToReact } from "@/lib/markdown/safeMarkdown";

const DEFAULT_MD = `# Welcome to Markdown Editor

This is a **live Markdown preview tool** built right into Flixo.

## Features:
- **Bold** & *Italic* text
- [Link to Flixo](https://flixo.app)
- Inline \`code\` blocks
- Unordered lists:
  - Fast
  - Secure
  - Free
`;

function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [tab, setTab] = useState<"edit" | "preview" | "split">("split");
  const [copied, setCopied] = useState(false);

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex rounded-xl border border-border p-1 bg-background">
          <button
            type="button"
            onClick={() => setTab("split")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "split"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "edit"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="size-3" />
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3" />
            Preview Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyMd}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied MD" : "Copy MD"}
          </button>
          <button
            type="button"
            onClick={handleDownloadMd}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <Download className="size-3.5" />
            Download .md
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${tab === "split" ? "md:grid-cols-2" : "grid-cols-1"}`}>
        {(tab === "edit" || tab === "split") && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Markdown Source</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-80 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        )}

        {(tab === "preview" || tab === "split") && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Live Render</label>
            <div className="w-full h-80 rounded-2xl border border-border bg-background p-5 overflow-y-auto text-sm leading-relaxed">
              {renderMarkdownToReact(markdown)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const MarkdownPreviewRuntime: ReadyToolRuntimeDefinition = {
  toolId: "markdown-preview",
  slug: "markdown-preview",
  categoryId: "developer",
  icon: FileCode,
  component: MarkdownPreviewTool,
  layoutDescription:
    "Write and preview Markdown with real-time split view and downloadable .md export.",
};
