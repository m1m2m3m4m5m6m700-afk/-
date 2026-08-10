import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { imageEnhancerRuntime } from "@/lib/tool-runtime/tools/image-enhancer";

export const Route = createFileRoute("/tools/image-enhancer")({
  head: createReadyToolHead(imageEnhancerRuntime),
  component: renderReadyToolPage(imageEnhancerRuntime),
});
