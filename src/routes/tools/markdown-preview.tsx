import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MarkdownPreviewRuntime } from "@/lib/tool-runtime/tools/markdown-preview";

export const Route = createFileRoute("/tools/markdown-preview")({
  head: createReadyToolHead(MarkdownPreviewRuntime),
  component: renderReadyToolPage(MarkdownPreviewRuntime),
});
