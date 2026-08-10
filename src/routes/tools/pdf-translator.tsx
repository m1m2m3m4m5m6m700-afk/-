import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfTranslatorRuntime } from "@/lib/tool-runtime/tools/pdf-translator";

export const Route = createFileRoute("/tools/pdf-translator")({
  head: createReadyToolHead(PdfTranslatorRuntime),
  component: renderReadyToolPage(PdfTranslatorRuntime),
});
