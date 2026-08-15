import { useState } from "react";
import { Archive, Download } from "lucide-react";
import JSZip from "jszip";
import type { ReadyToolRuntimeDefinition } from "../types";

function ArchiveExtractorTool() {
  const [entries, setEntries] = useState<Array<{ name: string; blob: Blob }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const extract = async (file: File) => {
    setBusy(true);
    setError(null);
    setEntries([]);
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const output: Array<{ name: string; blob: Blob }> = [];
      for (const [name, entry] of Object.entries(zip.files)) {
        if (entry.dir) continue;
        const bytes = await entry.async("uint8array");
        output.push({ name, blob: new Blob([bytes]) });
      }
      setEntries(output);
      if (!output.length) setError("The ZIP archive contains no extractable files.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The selected file is not a valid ZIP archive.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3"><Archive className="size-5 text-primary" /><div><h2 className="font-bold">Extract a ZIP archive</h2><p className="text-xs text-muted-foreground">Extraction happens locally in the browser.</p></div></div>
      <input type="file" accept=".zip,application/zip" onChange={(event) => { const file = event.target.files?.[0]; if (file) void extract(file); }} className="block w-full rounded-xl border border-border bg-background p-3 text-sm" />
      {busy && <p className="text-sm text-muted-foreground">Reading archive…</p>}
      {error && <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {entries.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold text-muted-foreground">{entries.length} file(s) found</p>{entries.map((entry) => <a key={entry.name} href={URL.createObjectURL(entry.blob)} download={entry.name.split("/").pop() || "file"} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted"><span className="truncate">{entry.name}</span><Download className="size-4 shrink-0 text-primary" /></a>)}</div>}
    </div>
  );
}

export const ArchiveExtractorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "archive-extractor",
  slug: "archive-extractor",
  categoryId: "files",
  icon: Archive,
  component: ArchiveExtractorTool,
  layoutDescription: "Open ZIP archives and extract individual files directly in the browser.",
};
