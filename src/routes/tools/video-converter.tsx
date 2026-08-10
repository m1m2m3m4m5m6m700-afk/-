import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { VideoConverterRuntime } from "@/lib/tool-runtime/tools/video-converter";

export const Route = createFileRoute("/tools/video-converter")({
  head: createReadyToolHead(VideoConverterRuntime),
  component: renderReadyToolPage(VideoConverterRuntime),
});
