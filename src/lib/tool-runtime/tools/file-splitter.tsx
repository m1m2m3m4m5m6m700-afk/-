import { useState } from "react";
import { Download, Files } from "lucide-react";
import JSZip from "jszip";
import type { ReadyToolRuntimeDefinition } from "../types";

function FileSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sizeMb, setSizeMb] = useState("10");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [parts, setParts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const split = async () => {
    if (!file || busy) return;
    const mb = Number(sizeMb);
    if (!Number.isFinite(mb) || mb <= 0 || mb > 500) {
      setError("Chunk size must be between 1 and 500 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    setParts(0);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    try {
      const chunkSize = Math.floor(mb * 1024 * 1024);
      const zip = new JSZip();
      let index = 0;
      for (let offset = 0; offset < file.size; offset += chunkSize) {
        index += 1;
        const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size));
        zip.file(`${file.name}.part-${String(index).padStart(4, "0")}`, await chunk.arrayBuffer());
      }
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      setParts(index);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not split the selected file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3"><Files className="size-5 text-primary" /><div><h2 className="font-bold">Split a large file</h2><p className="text-xs text-muted-foreground">The chunks are packaged into one ZIP so you can download them safely.</p></div></div>
      <input type="file" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setDownloadUrl(null); setError(null); }} className="block w-full rounded-xl border border-border bg-background p-3 text-sm" />
      <div className="flex flex-wrap items-center gap-2"><label className="text-sm font-semibold" htmlFor="chunk-size">Chunk size</label><input id="chunk-size" inputMode="decimal" value={sizeMb} onChange={(event) => setSizeMb(event.target.value.replace(/[^0-9.]/g, ""))} className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-sm"/><span className="text-xs text-muted-foreground">MB</span></div>
      <button type="button" onClick={() => void split()} disabled={!file || busy} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Splitting…" : "Split file"}</button>
      {error && <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {downloadUrl && <div className="space-y-2"><p className="text-xs text-muted-foreground">Created {parts} chunk(s).</p><a href={downloadUrl} download={`${file?.name ?? "file"}-parts.zip`} className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"><Download className="size-4" />Download chunks</a></div>}
    </div>
  );
}

export const FileSplitterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "file-splitter",
  slug: "file-splitter",
  categoryId: "files",
  icon: Files,
  component: FileSplitterTool,
  layoutDescription: "Split large local files into numbered chunks and download them as a ZIP archive.",
};
