import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SummarizerRuntime } from "@/lib/tool-runtime/tools/summarizer";

export const Route = createFileRoute("/tools/summarizer")({
  head: createReadyToolHead(SummarizerRuntime),
  component: renderReadyToolPage(SummarizerRuntime),
});
