import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { LanguageDetectionRuntime } from "@/lib/tool-runtime/tools/language-detection";

export const Route = createFileRoute("/tools/language-detection")({
  head: createReadyToolHead(LanguageDetectionRuntime),
  component: renderReadyToolPage(LanguageDetectionRuntime),
});
