import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfToTextRuntime } from "@/lib/tool-runtime/tools/pdf-to-text";

export const Route = createFileRoute("/tools/pdf-to-text")({
  head: createReadyToolHead(PdfToTextRuntime),
  component: renderReadyToolPage(PdfToTextRuntime),
});
