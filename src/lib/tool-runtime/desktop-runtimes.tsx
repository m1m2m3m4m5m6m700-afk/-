import { useState } from "react";
import { Check, Copy, Download, MonitorCog, Play } from "lucide-react";
import { allDesktopTools, type AllDesktopTool } from "@/lib/desktop-tools";
import type { ReadyToolRuntimeDefinition } from "./types";

function DesktopTool({ spec }: { spec: AllDesktopTool }) {
  const [input, setInput] = useState(spec.sampleInput);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = () => {
    setError(null);
    setCopied(false);
    try {
      setOutput(spec.run(input));
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "The tool could not process this input.");
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${spec.slug}-result.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <MonitorCog className="size-4" />
            Desktop Utility Engine
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{spec.description}</p>
        </div>
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Play className="size-4" />
          Run tool
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold">Input</label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-h-64 w-full resize-y rounded-2xl border border-border bg-background p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="text-sm font-semibold">Output</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => void copy()} disabled={!output} className="inline-flex items-center gap-1 text-xs text-primary disabled:opacity-40">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" onClick={download} disabled={!output} className="inline-flex items-center gap-1 text-xs text-primary disabled:opacity-40">
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          </div>
          <pre className="min-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-border bg-background p-4 font-mono text-sm">
            {error ?? output || "Run the tool to see the result."}
          </pre>
        </div>
      </div>
    </div>
  );
}

export const desktopToolRuntimes: ReadyToolRuntimeDefinition[] = allDesktopTools.map((spec) => ({
  toolId: spec.id,
  slug: spec.slug,
  categoryId: spec.categoryId,
  icon: MonitorCog,
  component: () => <DesktopTool spec={spec} />,
  layoutDescription: spec.description,
  seoOverride: {
    slug: spec.slug,
    title: `${spec.name} — Free Online Desktop Utility | Flixo`,
    description: `${spec.description} Free, private browser-based desktop utility from Flixo.`,
    keywords: [...spec.tags, "free", "online", "Flixo"],
    overview: spec.description,
    features: ["Instant browser processing", "No account required", "Copy or download results", "Privacy-first local execution"],
    howToUse: ["Enter your input.", "Run the tool.", "Review and copy or download the result."],
    benefits: ["Fast desktop-style workflow", "Browser-first execution", "No file upload required for text operations"],
    faqs: [
      { question: `Is ${spec.name} free?`, answer: "Yes. This Flixo utility is available without a subscription or account." },
      { question: "Is my input uploaded?", answer: "The computation is performed in the browser and the tool does not require uploading input to a third-party analytics service." },
    ],
  },
}));
