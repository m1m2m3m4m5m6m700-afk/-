import { useMemo, useRef, useState } from "react";
import { AudioLines, CheckCircle2, FileText, ImageIcon, Search, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEGA_TOOLS, MEGA_TOOL_CATEGORIES } from "@/data/megaToolsCatalog.mjs";
import { runMegaTool } from "@/lib/megaToolsEngineAdapter.mjs";
import type { MegaTool, MegaToolResult } from "@/types/mega-tools";

const CATEGORY_META = {
  images: { icon: ImageIcon, accept: "image/*", hint: "JPG, PNG, WebP, GIF and common image formats" },
  video: { icon: Video, accept: "video/*", hint: "MP4, WebM and browser-supported video formats" },
  audio: { icon: AudioLines, accept: "audio/*", hint: "MP3, WAV, OGG and browser-supported audio formats" },
  pdf: { icon: FileText, accept: "application/pdf,.pdf", hint: "PDF documents" },
} as const;

type Tool = MegaTool;
type Result = MegaToolResult;

export function MegaToolHub() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORY_META>("images");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Tool | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = useMemo(
    () => MEGA_TOOLS.filter((tool) => tool.category === activeCategory && `${tool.name} ${tool.description}`.toLowerCase().includes(query.trim().toLowerCase())),
    [activeCategory, query],
  );
  const meta = CATEGORY_META[activeCategory];
  const Icon = meta.icon;

  const clearResult = () => {
    if (result && "cleanup" in result && typeof result.cleanup === "function") result.cleanup();
    if (result?.type === "download") URL.revokeObjectURL(result.url);
    setResult(null);
  };

  const openTool = (tool: Tool) => {
    clearResult();
    setSelected(tool);
    setFile(null);
    setError(null);
    setTimeout(() => inputRef.current?.click(), 0);
  };

  const close = () => {
    clearResult();
    setSelected(null);
    setFile(null);
    setError(null);
    setBusy(false);
  };

  const run = async () => {
    if (!selected || !file) return;
    setBusy(true);
    setError(null);
    clearResult();
    try {
      setResult(await runMegaTool(selected, file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The tool failed to process this file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="mega-tools" className="space-y-8 py-8">
      <div className="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="size-3.5" /> 528 executable tool variants
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Everything for your files</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              Four focused workspaces with hundreds of preset tools built on a shared browser execution engine.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this section…" className="h-11 w-full rounded-2xl border border-border bg-background/80 ps-9 pe-4 text-sm outline-none transition focus:border-primary/40" />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1 sm:grid-cols-4">
          {(Object.keys(MEGA_TOOL_CATEGORIES) as Array<keyof typeof CATEGORY_META>).map((key) => {
            const CategoryIcon = CATEGORY_META[key].icon;
            const active = activeCategory === key;
            return <button key={key} onClick={() => { setActiveCategory(key); setQuery(""); }} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}><CategoryIcon className="size-4" />{MEGA_TOOL_CATEGORIES[key]}</button>;
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 px-1">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
        <div><h3 className="font-black">{MEGA_TOOL_CATEGORIES[activeCategory]}</h3><p className="text-xs text-muted-foreground">{tools.length} tools in this section</p></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <button key={tool.slug} onClick={() => openTool(tool)} className="group flex min-h-32 flex-col rounded-2xl border border-border/70 bg-card/75 p-4 text-start transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[.03] hover:shadow-lg">
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-bold group-hover:text-primary">{tool.name}</span><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{tool.preset}</span></div>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{tool.description}</p>
            <span className="mt-auto pt-3 text-xs font-semibold text-primary">Open tool →</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">{MEGA_TOOL_CATEGORIES[selected.category]}</p><h3 className="mt-1 text-2xl font-black">{selected.name}</h3><p className="mt-2 text-sm text-muted-foreground">{meta.hint}</p></div><Button variant="ghost" size="icon" onClick={close}><X className="size-5" /></Button></div>
            <input ref={inputRef} type="file" accept={meta.accept} className="hidden" onChange={(event) => { setFile(event.target.files?.[0] ?? null); clearResult(); setError(null); }} />
            <button onClick={() => inputRef.current?.click()} className="mt-6 w-full rounded-2xl border-2 border-dashed border-border bg-muted/30 px-5 py-10 text-center transition hover:border-primary/40"><div className="text-sm font-bold">{file ? file.name : "Choose a file"}</div><div className="mt-1 text-xs text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : meta.hint}</div></button>
            {error && <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
            {result?.type === "text" && <pre className="mt-4 max-h-72 overflow-auto rounded-2xl border border-border bg-muted/30 p-4 text-xs leading-5 whitespace-pre-wrap">{result.text}</pre>}
            {result?.type === "download" && <a href={result.url} download={result.filename} className="mt-4 block rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary">Download result: {result.filename}</a>}
            {result?.type === "video" && <div className="mt-4" ref={(node) => { if (node && result.element.parentElement !== node) { node.innerHTML = ""; node.appendChild(result.element); } }} />}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={close}>Close</Button><Button onClick={() => void run()} disabled={!file || busy}>{busy ? "Processing…" : "Run tool"}</Button></div>
          </div>
        </div>
      )}
    </section>
  );
}
