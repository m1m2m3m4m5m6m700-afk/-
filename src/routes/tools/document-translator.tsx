import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { DocumentTranslatorRuntime } from "@/lib/tool-runtime/tools/document-translator";

export const Route = createFileRoute("/tools/document-translator")({
  head: createReadyToolHead(DocumentTranslatorRuntime),
  component: renderReadyToolPage(DocumentTranslatorRuntime),
});
