import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SharpenImageRuntime } from "@/lib/tool-runtime/tools/sharpen-image";

export const Route = createFileRoute("/tools/sharpen-image")({
  head: createReadyToolHead(SharpenImageRuntime),
  component: renderReadyToolPage(SharpenImageRuntime),
});
