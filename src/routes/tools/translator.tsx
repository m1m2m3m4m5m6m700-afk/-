import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { translatorRuntime } from "@/lib/tool-runtime/tools/translator";

export const Route = createFileRoute("/tools/translator")({
  head: createReadyToolHead(translatorRuntime),
  component: renderReadyToolPage(translatorRuntime),
});
