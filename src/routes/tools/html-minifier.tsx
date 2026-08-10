import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { HtmlMinifierRuntime } from "@/lib/tool-runtime/tools/html-minifier";

export const Route = createFileRoute("/tools/html-minifier")({
  head: createReadyToolHead(HtmlMinifierRuntime),
  component: renderReadyToolPage(HtmlMinifierRuntime),
});
