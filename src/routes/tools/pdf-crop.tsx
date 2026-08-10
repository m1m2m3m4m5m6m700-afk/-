import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfCropRuntime } from "@/lib/tool-runtime/tools/pdf-crop";

export const Route = createFileRoute("/tools/pdf-crop")({
  head: createReadyToolHead(PdfCropRuntime),
  component: renderReadyToolPage(PdfCropRuntime),
});
