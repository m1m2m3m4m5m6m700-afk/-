import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { BlurImageRuntime } from "@/lib/tool-runtime/tools/blur-image";

export const Route = createFileRoute("/tools/blur-image")({
  head: createReadyToolHead(BlurImageRuntime),
  component: renderReadyToolPage(BlurImageRuntime),
});
