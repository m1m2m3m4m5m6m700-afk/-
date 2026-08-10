import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MarkdownToPdfRuntime } from "@/lib/tool-runtime/tools/markdown-to-pdf";

export const Route = createFileRoute("/tools/markdown-to-pdf")({
  head: createReadyToolHead(MarkdownToPdfRuntime),
  component: renderReadyToolPage(MarkdownToPdfRuntime),
});
