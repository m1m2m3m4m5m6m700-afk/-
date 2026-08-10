import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CropImageRuntime } from "@/lib/tool-runtime/tools/crop-image";

export const Route = createFileRoute("/tools/crop-image")({
  head: createReadyToolHead(CropImageRuntime),
  component: renderReadyToolPage(CropImageRuntime),
});
