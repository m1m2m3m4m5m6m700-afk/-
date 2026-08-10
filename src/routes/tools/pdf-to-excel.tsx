import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfToExcelRuntime } from "@/lib/tool-runtime/tools/pdf-to-excel";

export const Route = createFileRoute("/tools/pdf-to-excel")({
  head: createReadyToolHead(PdfToExcelRuntime),
  component: renderReadyToolPage(PdfToExcelRuntime),
});
