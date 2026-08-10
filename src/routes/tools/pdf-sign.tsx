import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfSignRuntime } from "@/lib/tool-runtime/tools/pdf-sign";

export const Route = createFileRoute("/tools/pdf-sign")({
  head: createReadyToolHead(PdfSignRuntime),
  component: renderReadyToolPage(PdfSignRuntime),
});
