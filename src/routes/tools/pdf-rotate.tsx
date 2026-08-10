import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfRotateRuntime } from "@/lib/tool-runtime/tools/pdf-rotate";

export const Route = createFileRoute("/tools/pdf-rotate")({
  head: createReadyToolHead(PdfRotateRuntime),
  component: renderReadyToolPage(PdfRotateRuntime),
});
