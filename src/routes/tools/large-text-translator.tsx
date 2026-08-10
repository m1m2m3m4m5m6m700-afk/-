import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { LargeTextTranslatorRuntime } from "@/lib/tool-runtime/tools/large-text-translator";

export const Route = createFileRoute("/tools/large-text-translator")({
  head: createReadyToolHead(LargeTextTranslatorRuntime),
  component: renderReadyToolPage(LargeTextTranslatorRuntime),
});
