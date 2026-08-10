import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SubtitleTranslatorRuntime } from "@/lib/tool-runtime/tools/subtitle-translator";

export const Route = createFileRoute("/tools/subtitle-translator")({
  head: createReadyToolHead(SubtitleTranslatorRuntime),
  component: renderReadyToolPage(SubtitleTranslatorRuntime),
});
