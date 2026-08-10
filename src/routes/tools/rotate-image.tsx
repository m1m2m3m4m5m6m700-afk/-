import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RotateImageRuntime } from "@/lib/tool-runtime/tools/rotate-image";

export const Route = createFileRoute("/tools/rotate-image")({
  head: createReadyToolHead(RotateImageRuntime),
  component: renderReadyToolPage(RotateImageRuntime),
});
