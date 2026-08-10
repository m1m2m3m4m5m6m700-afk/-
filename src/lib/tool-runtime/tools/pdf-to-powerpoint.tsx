import { useState } from "react";
import { Presentation, Download, RefreshCw, Upload, ShieldCheck, AlertCircle } from "lucide-react";
import {
  assertFileValid,
  downloadBlob,
  formatBytes,
  friendlyError,
  getPdfjs,
  readFileAsArrayBuffer,
} from "@/lib/utils";
import type { ReadyToolRuntimeDefinition } from "../types";

function PdfToPowerpointTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; slides: number; size: number } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    setProgress(0);
    try {
      assertFileValid(file, { kind: "PDF", maxBytes: 100 * 1024 * 1024 });
      const pdfjs = await getPdfjs();
      const data = await readFileAsArrayBuffer(file);
      const pdf = await pdfjs.getDocument({ data }).promise;
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      let slideIndex = 1;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported.");
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        zip.file(`ppt/media/slide${slideIndex}.png`, base64, { base64: true });
        addSlideXml(zip, slideIndex, viewport.width, viewport.height);
        slideIndex++;
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      zip.file("[Content_Types].xml", contentTypesXml(pdf.numPages));
      zip.file("_rels/.rels", rootRelsXml());
      zip.file("ppt/presentation.xml", presentationXml(pdf.numPages));
      zip.file("ppt/_rels/presentation.xml.rels", presentationRelsXml(pdf.numPages));
      zip.file("ppt/presProps.xml", presPropsXml());

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const outName = file.name.replace(/\.pdf$/i, "") + ".pptx";
      downloadBlob(blob, outName);
      setResult({ name: outName, slides: pdf.numPages, size: blob.size });
    } catch (e) {
      setError(
        friendlyError(e, "Failed to convert PDF to PowerPoint. It may be damaged or protected."),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">Upload PDF File</label>
          <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="pdf-ppt-upload"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setError("");
                  setResult(null);
                  setProgress(0);
                }
              }}
            />
            <label
              htmlFor="pdf-ppt-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a PDF here, or click to browse"}
              </span>
              {file && (
                <span className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Renders each PDF page to a full-slide image inside a real .pptx file. One slide per
            page.
          </p>
          <button
            type="button"
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Converting... {progress}%
              </>
            ) : (
              <>
                <Presentation className="size-4" />
                Convert to PowerPoint
              </>
            )}
          </button>
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div className="h-full rounded-2xl border border-border bg-background/50 p-4 text-sm flex flex-col items-center justify-center text-center gap-3">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <AlertCircle className="size-8" />
                <span className="text-xs">{error}</span>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <Presentation className="size-8" />
                <span className="text-sm font-semibold">{result.name}</span>
                <span className="text-xs text-muted-foreground">
                  {result.slides} slides · {formatBytes(result.size)}
                </span>
                <span className="text-xs">Downloaded successfully</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Presentation className="size-8 opacity-40" />
                <span>Your PowerPoint will download here.</span>
                <span className="text-[11px] text-muted-foreground">
                  Each page becomes a slide image; text is not editable.
                </span>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5 flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              100% Client-side processing. Your files and data remain strictly on your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMU = 9525;
function addSlideXml(zip: import("jszip"), idx: number, wPx: number, hPx: number) {
  const wEmu = Math.round(wPx * EMU);
  const hEmu = Math.round(hPx * EMU);
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvGrpSpPr/><p:nvGrpSpPr/><p:grpSpPr/>
<p:nvPicPr><p:cNvPr id="1" name="Slide ${idx}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
<p:picPr><a:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></a:blipFill><a:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wEmu}" cy="${hEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></a:spPr></p:picPr>
<p:grpSpPr/></p:nvGrpSpPr>
</p:spTree></p:cSld></p:sld>`;
  zip.file(`ppt/slides/slide${idx}.xml`, xml);
  zip.file(
    `ppt/slides/_rels/slide${idx}.xml.rels`,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/slide${idx}.png"/></Relationships>`,
  );
}
function contentTypesXml(slides: number) {
  const slideOverrides = Array.from(
    { length: slides },
    (_, i) =>
      `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>${slideOverrides}</Types>`;
}
function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
}
function presentationXml(slides: number) {
  const sldIds = Array.from(
    { length: slides },
    (_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst>${sldIds}</p:sldIdLst></p:presentation>`;
}
function presentationRelsXml(slides: number) {
  const rels = Array.from(
    { length: slides },
    (_, i) =>
      `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`,
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}
function presPropsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>`;
}

export const PdfToPowerpointRuntime: ReadyToolRuntimeDefinition = {
  toolId: "pdf-to-powerpoint",
  slug: "pdf-to-powerpoint",
  categoryId: "pdf",
  icon: Presentation,
  component: PdfToPowerpointTool,
  layoutDescription:
    "Convert each PDF page into an image-based PowerPoint slide (text is not editable), entirely in your browser.",
  layoutDescriptionKey: "tool.pdf-to-powerpoint.pageDescription",
};
