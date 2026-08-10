import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfWatermarkRuntime } from "@/lib/tool-runtime/tools/pdf-watermark";

export const Route = createFileRoute("/tools/pdf-watermark")({
  head: createReadyToolHead(PdfWatermarkRuntime),
  component: renderReadyToolPage(PdfWatermarkRuntime),
});
