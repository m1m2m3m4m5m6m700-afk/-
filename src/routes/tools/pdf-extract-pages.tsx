import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfExtractPagesRuntime } from "@/lib/tool-runtime/tools/pdf-extract-pages";

export const Route = createFileRoute("/tools/pdf-extract-pages")({
  head: createReadyToolHead(PdfExtractPagesRuntime),
  component: renderReadyToolPage(PdfExtractPagesRuntime),
});
