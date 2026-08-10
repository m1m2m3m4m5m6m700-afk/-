import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { JsMinifierRuntime } from "@/lib/tool-runtime/tools/js-minifier";

export const Route = createFileRoute("/tools/js-minifier")({
  head: createReadyToolHead(JsMinifierRuntime),
  component: renderReadyToolPage(JsMinifierRuntime),
});
