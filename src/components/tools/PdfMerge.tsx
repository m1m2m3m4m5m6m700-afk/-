import { FilePlus2, FileText, GripVertical, Trash2, Download, Merge } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type PdfItem = {
  id: string;
  file: File;
};

export function PdfMerge() {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bytes: number; pages: number; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const releaseResultUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const totalBytes = useMemo(() => items.reduce((sum, item) => sum + item.file.size, 0), [items]);

  const addFiles = (incoming: File[]) => {
    setError(null);
    releaseResultUrl();
    setResult(null);
    const pdfs = incoming.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length !== incoming.length) {
      setError("Only PDF files are accepted.");
    }
    const validSize = pdfs.filter((file) => file.size <= MAX_FILE_SIZE);
    if (validSize.length !== pdfs.length) {
      setError(`Each PDF must be 50 MB or smaller.`);
    }
    const room = Math.max(0, MAX_FILES - items.length);
    const accepted = validSize.slice(0, room);
    if (accepted.length < validSize.length) {
      setError(`You can merge up to ${MAX_FILES} PDF files at once.`);
    }
    if (!accepted.length) return;
    setItems((current) => [
      ...current,
      ...accepted.map((file, index) => ({ id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`, file })),
    ]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    setItems((current) => {
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    releaseResultUrl();
    setResult(null);
  };

  const remove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    releaseResultUrl();
    setResult(null);
    setError(null);
  };

  const merge = async () => {
    if (items.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }

    setBusy(true);
    setError(null);
    releaseResultUrl();
    setResult(null);
    try {
      const output = await PDFDocument.create();
      let pageCount = 0;

      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const source = await PDFDocument.load(bytes, { ignoreEncryption: false });
        const pages = await output.copyPages(source, source.getPageIndices());
        pages.forEach((page) => output.addPage(page));
        pageCount += pages.length;
      }

      output.setTitle("Flixo merged PDF");
      const merged = await output.save({ useObjectStreams: false });
      const blobBytes = new ArrayBuffer(merged.byteLength);
      new Uint8Array(blobBytes).set(merged);
      const blob = new Blob([blobBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setResult({ bytes: merged.byteLength, pages: pageCount, url });
    } catch (cause) {
      setError(cause instanceof Error ? `Could not merge the PDFs: ${cause.message}` : "Could not merge the PDFs.");
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setItems([]);
    releaseResultUrl();
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div data-pdf-merge-ready="true" className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Merge className="size-4 text-primary" />
            Merge PDF
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Combine up to 20 local PDF files into one ordered document.</p>
        </div>
        <input
          ref={inputRef}
          data-pdf-merge-input="true"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
        />
        <Button type="button" variant="outline" className="rounded-xl text-xs" onClick={() => inputRef.current?.click()}>
          <FilePlus2 className="me-1.5 size-3.5" />
          Add PDFs
        </Button>
      </div>

      <div className="mt-5 space-y-3" data-pdf-merge-list="true">
        {items.length === 0 ? (
          <button
            type="button"
            className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 text-center hover:bg-surface/60"
            onClick={() => inputRef.current?.click()}
          >
            <FileText className="mb-3 size-9 text-muted-foreground/50" />
            <span className="text-sm font-medium">Select PDF files</span>
            <span className="mt-1 text-xs text-muted-foreground">Files stay on this device.</span>
          </button>
        ) : (
          items.map((item, index) => (
            <div key={item.id} data-pdf-merge-item="true" className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/50 p-3">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-[11px] text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${item.file.name} up`}>
                  ↑
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${item.file.name} down`}>
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {items.length} file{items.length === 1 ? "" : "s"} · {(totalBytes / 1024 / 1024).toFixed(2)} MB total
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" className="rounded-xl text-xs" onClick={clear} disabled={busy || items.length === 0}>
            Clear
          </Button>
          <Button type="button" size="sm" className="rounded-xl text-xs" onClick={merge} disabled={busy || items.length < 2}>
            {busy ? "Merging…" : "Merge PDFs"}
          </Button>
        </div>
      </div>

      {error ? <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div> : null}

      {result ? (
        <div data-pdf-merge-result="true" className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Merged PDF ready</p>
            <p className="mt-1 text-xs text-muted-foreground">{result.pages} pages · {(result.bytes / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <a className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground" href={result.url} download="flixo-merged.pdf" data-pdf-merge-download="true">
            <Download className="me-1.5 size-3.5" />
            Download PDF
          </a>
        </div>
      ) : null}
    </div>
  );
}
