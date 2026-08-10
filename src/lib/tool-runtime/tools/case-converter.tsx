import { useState } from "react";
import { Type, Copy, Check, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function CaseConverterTool() {
  const [text, setText] = useState("");
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  const converters = [
    {
      id: "uppercase",
      label: "UPPERCASE",
      transform: (str: string) => str.toUpperCase(),
    },
    {
      id: "lowercase",
      label: "lowercase",
      transform: (str: string) => str.toLowerCase(),
    },
    {
      id: "titlecase",
      label: "Title Case",
      transform: (str: string) =>
        str
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
    },
    {
      id: "sentencecase",
      label: "Sentence case",
      transform: (str: string) =>
        str.toLowerCase().replace(/(^\s*\w|[.?!]\s*\w)/g, (c) => c.toUpperCase()),
    },
    {
      id: "camelcase",
      label: "camelCase",
      transform: (str: string) =>
        str
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase(),
          )
          .replace(/\s+/g, ""),
    },
    {
      id: "pascalcase",
      label: "PascalCase",
      transform: (str: string) =>
        str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, ""),
    },
    {
      id: "kebabcase",
      label: "kebab-case",
      transform: (str: string) =>
        str
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
    },
    {
      id: "snakecase",
      label: "snake_case",
      transform: (str: string) =>
        str
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "_"),
    },
    {
      id: "constantcase",
      label: "CONSTANT_CASE",
      transform: (str: string) =>
        str
          .toUpperCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "_"),
    },
  ];

  const handleCopyMode = (modeId: string, transformedText: string) => {
    if (!transformedText) return;
    navigator.clipboard.writeText(transformedText);
    setCopiedMode(modeId);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Source Text</label>
          <button
            type="button"
            onClick={() => setText("")}
            disabled={!text}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here to instantly convert case formats..."
          className="w-full h-36 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Converted Variations</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {converters.map((conv) => {
            const transformed = text ? conv.transform(text) : "";
            return (
              <div
                key={conv.id}
                className="rounded-2xl border border-border bg-background/50 p-3.5 space-y-1.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{conv.label}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyMode(conv.id, transformed)}
                    disabled={!transformed}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    {copiedMode === conv.id ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-foreground truncate min-h-[1.25rem]">
                  {transformed || (
                    <span className="text-muted-foreground/50 italic">Sample preview</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const CaseConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "case-converter",
  slug: "case-converter",
  categoryId: "utilities",
  icon: Type,
  component: CaseConverterTool,
  layoutDescription:
    "Convert text into UPPERCASE, lowercase, Title Case, camelCase, kebab-case, snake_case, and more.",
};
