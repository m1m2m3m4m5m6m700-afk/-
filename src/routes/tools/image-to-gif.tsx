import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageToGifRuntime } from "@/lib/tool-runtime/tools/image-to-gif";

export const Route = createFileRoute("/tools/image-to-gif")({
  head: createReadyToolHead(ImageToGifRuntime),
  component: renderReadyToolPage(ImageToGifRuntime),
});
