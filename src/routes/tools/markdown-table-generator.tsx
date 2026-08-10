import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MarkdownTableGeneratorRuntime } from "@/lib/tool-runtime/tools/markdown-table-generator";

export const Route = createFileRoute("/tools/markdown-table-generator")({
  head: createReadyToolHead(MarkdownTableGeneratorRuntime),
  component: renderReadyToolPage(MarkdownTableGeneratorRuntime),
});
