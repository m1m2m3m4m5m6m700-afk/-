import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { DocxTranslatorRuntime } from "@/lib/tool-runtime/tools/docx-translator";

export const Route = createFileRoute("/tools/docx-translator")({
  head: createReadyToolHead(DocxTranslatorRuntime),
  component: renderReadyToolPage(DocxTranslatorRuntime),
});
