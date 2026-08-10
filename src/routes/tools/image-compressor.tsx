import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { imageCompressorRuntime } from "@/lib/tool-runtime/tools/image-compressor";

export const Route = createFileRoute("/tools/image-compressor")({
  head: createReadyToolHead(imageCompressorRuntime),
  component: renderReadyToolPage(imageCompressorRuntime),
});
