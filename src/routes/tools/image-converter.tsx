import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageConverterRuntime } from "@/lib/tool-runtime/tools/image-converter";

export const Route = createFileRoute("/tools/image-converter")({
  head: createReadyToolHead(ImageConverterRuntime),
  component: renderReadyToolPage(ImageConverterRuntime),
});
