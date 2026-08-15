import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function MetadataViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const metadata = useMemo(() => {
    if (!file) return null;
    const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    return {
      name: file.name,
      size: file.size.toLocaleString(),
      type: file.type || "unknown",
      extension: extension ? `.${extension}` : "—",
      modified: new Date(file.lastModified).toLocaleString(),
    };
  }, [file]);

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3"><FileSearch className="size-5 text-primary" /><div><h2 className="font-bold">Inspect file metadata</h2><p className="text-xs text-muted-foreground">Only browser-provided metadata is read; file contents are not uploaded.</p></div></div>
      <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-xl border border-border bg-background p-3 text-sm" />
      {metadata && <dl className="grid gap-3 sm:grid-cols-2">{Object.entries(metadata).map(([key, value]) => <div key={key} className="rounded-xl border border-border bg-background p-3"><dt className="text-[11px] font-semibold uppercase text-muted-foreground">{key}</dt><dd className="mt-1 break-all text-sm font-medium">{value}</dd></div>)}</dl>}
    </div>
  );
}

export const MetadataViewerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "metadata-viewer",
  slug: "metadata-viewer",
  categoryId: "files",
  icon: FileSearch,
  component: MetadataViewerTool,
  layoutDescription: "Inspect basic local file metadata without uploading the file to a server.",
};
