import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfToWordRuntime } from "@/lib/tool-runtime/tools/pdf-to-word";

export const Route = createFileRoute("/tools/pdf-to-word")({
  head: createReadyToolHead(PdfToWordRuntime),
  component: renderReadyToolPage(PdfToWordRuntime),
});
