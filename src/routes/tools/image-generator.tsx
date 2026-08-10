import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageGeneratorRuntime } from "@/lib/tool-runtime/tools/image-generator";

export const Route = createFileRoute("/tools/image-generator")({
  head: createReadyToolHead(ImageGeneratorRuntime),
  component: renderReadyToolPage(ImageGeneratorRuntime),
});
