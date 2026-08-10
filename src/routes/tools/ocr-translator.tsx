import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { OcrTranslatorRuntime } from "@/lib/tool-runtime/tools/ocr-translator";

export const Route = createFileRoute("/tools/ocr-translator")({
  head: createReadyToolHead(OcrTranslatorRuntime),
  component: renderReadyToolPage(OcrTranslatorRuntime),
});
