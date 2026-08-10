import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageResizerRuntime } from "@/lib/tool-runtime/tools/image-resizer";

export const Route = createFileRoute("/tools/image-resizer")({
  head: createReadyToolHead(ImageResizerRuntime),
  component: renderReadyToolPage(ImageResizerRuntime),
});
