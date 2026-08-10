import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { GifCompressorRuntime } from "@/lib/tool-runtime/tools/gif-compressor";

export const Route = createFileRoute("/tools/gif-compressor")({
  head: createReadyToolHead(GifCompressorRuntime),
  component: renderReadyToolPage(GifCompressorRuntime),
});
