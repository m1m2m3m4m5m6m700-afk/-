import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { HtmlFormatterRuntime } from "@/lib/tool-runtime/tools/html-formatter";

export const Route = createFileRoute("/tools/html-formatter")({
  head: createReadyToolHead(HtmlFormatterRuntime),
  component: renderReadyToolPage(HtmlFormatterRuntime),
});
