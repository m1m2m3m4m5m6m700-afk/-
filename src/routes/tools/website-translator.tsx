import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { WebsiteTranslatorRuntime } from "@/lib/tool-runtime/tools/website-translator";

export const Route = createFileRoute("/tools/website-translator")({
  head: createReadyToolHead(WebsiteTranslatorRuntime),
  component: renderReadyToolPage(WebsiteTranslatorRuntime),
});
