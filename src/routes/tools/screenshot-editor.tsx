import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ScreenshotEditorRuntime } from "@/lib/tool-runtime/tools/screenshot-editor";

export const Route = createFileRoute("/tools/screenshot-editor")({
  head: createReadyToolHead(ScreenshotEditorRuntime),
  component: renderReadyToolPage(ScreenshotEditorRuntime),
});
