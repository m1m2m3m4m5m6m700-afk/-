import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfOcrRuntime } from "@/lib/tool-runtime/tools/pdf-ocr";

export const Route = createFileRoute("/tools/pdf-ocr")({
  head: createReadyToolHead(PdfOcrRuntime),
  component: renderReadyToolPage(PdfOcrRuntime),
});
