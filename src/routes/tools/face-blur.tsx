import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { FaceBlurRuntime } from "@/lib/tool-runtime/tools/face-blur";

export const Route = createFileRoute("/tools/face-blur")({
  head: createReadyToolHead(FaceBlurRuntime),
  component: renderReadyToolPage(FaceBlurRuntime),
});
