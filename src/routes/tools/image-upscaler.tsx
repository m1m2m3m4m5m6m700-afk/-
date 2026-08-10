import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageUpscalerRuntime } from "@/lib/tool-runtime/tools/image-upscaler";

export const Route = createFileRoute("/tools/image-upscaler")({
  head: createReadyToolHead(ImageUpscalerRuntime),
  component: renderReadyToolPage(ImageUpscalerRuntime),
});
