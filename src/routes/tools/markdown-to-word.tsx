import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MarkdownToWordRuntime } from "@/lib/tool-runtime/tools/markdown-to-word";

export const Route = createFileRoute("/tools/markdown-to-word")({
  head: createReadyToolHead(MarkdownToWordRuntime),
  component: renderReadyToolPage(MarkdownToWordRuntime),
});
