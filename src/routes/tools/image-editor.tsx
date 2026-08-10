import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ImageEditorRuntime } from "@/lib/tool-runtime/tools/image-editor";

export const Route = createFileRoute("/tools/image-editor")({
  head: createReadyToolHead(ImageEditorRuntime),
  component: renderReadyToolPage(ImageEditorRuntime),
});
