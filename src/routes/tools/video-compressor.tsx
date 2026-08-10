import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { VideoCompressorRuntime } from "@/lib/tool-runtime/tools/video-compressor";

export const Route = createFileRoute("/tools/video-compressor")({
  head: createReadyToolHead(VideoCompressorRuntime),
  component: renderReadyToolPage(VideoCompressorRuntime),
});
