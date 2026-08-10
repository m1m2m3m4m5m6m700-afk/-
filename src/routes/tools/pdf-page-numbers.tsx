import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfPageNumbersRuntime } from "@/lib/tool-runtime/tools/pdf-page-numbers";

export const Route = createFileRoute("/tools/pdf-page-numbers")({
  head: createReadyToolHead(PdfPageNumbersRuntime),
  component: renderReadyToolPage(PdfPageNumbersRuntime),
});
