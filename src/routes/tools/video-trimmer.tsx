import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { VideoTrimmerRuntime } from "@/lib/tool-runtime/tools/video-trimmer";

export const Route = createFileRoute("/tools/video-trimmer")({
  head: createReadyToolHead(VideoTrimmerRuntime),
  component: renderReadyToolPage(VideoTrimmerRuntime),
});
