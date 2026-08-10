import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { VideoToGifRuntime } from "@/lib/tool-runtime/tools/video-to-gif";

export const Route = createFileRoute("/tools/video-to-gif")({
  head: createReadyToolHead(VideoToGifRuntime),
  component: renderReadyToolPage(VideoToGifRuntime),
});
