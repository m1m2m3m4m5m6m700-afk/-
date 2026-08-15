import { useState } from "react";
import { Archive, Download } from "lucide-react";
import JSZip from "jszip";
import type { ReadyToolRuntimeDefinition } from "../types";

function ZipCreatorTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const createZip = async () => {
    if (!files.length || busy) return;
    setBusy(true);
    setError(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    try {
      const zip = new JSZip();
      for (const file of files) zip.file(file.name, await file.arrayBuffer());
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the ZIP archive.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3"><Archive className="size-5 text-primary" /><div><h2 className="font-bold">Create a ZIP archive</h2><p className="text-xs text-muted-foreground">Files stay in your browser until you download the archive.</p></div></div>
      <input type="file" multiple onChange={(event) => { setFiles(Array.from(event.target.files ?? [])); setDownloadUrl(null); setError(null); }} className="block w-full rounded-xl border border-border bg-background p-3 text-sm" />
      {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} file(s) selected.</p>}
      <button type="button" onClick={() => void createZip()} disabled={!files.length || busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Creating…" : "Create ZIP"}</button>
      {error && <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
      {downloadUrl && <a href={downloadUrl} download="flixo-files.zip" className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"><Download className="size-4" />Download ZIP</a>}
    </div>
  );
}

export const ZipCreatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "zip-creator",
  slug: "zip-creator",
  categoryId: "files",
  icon: Archive,
  component: ZipCreatorTool,
  layoutDescription: "Create a standard ZIP archive from multiple local files in your browser.",
};
