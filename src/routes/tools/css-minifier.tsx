import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CssMinifierRuntime } from "@/lib/tool-runtime/tools/css-minifier";

export const Route = createFileRoute("/tools/css-minifier")({
  head: createReadyToolHead(CssMinifierRuntime),
  component: renderReadyToolPage(CssMinifierRuntime),
});
