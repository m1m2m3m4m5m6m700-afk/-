import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfHeaderFooterRuntime } from "@/lib/tool-runtime/tools/pdf-header-footer";

export const Route = createFileRoute("/tools/pdf-header-footer")({
  head: createReadyToolHead(PdfHeaderFooterRuntime),
  component: renderReadyToolPage(PdfHeaderFooterRuntime),
});
