import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { WordToPdfRuntime } from "@/lib/tool-runtime/tools/word-to-pdf";

export const Route = createFileRoute("/tools/word-to-pdf")({
  head: createReadyToolHead(WordToPdfRuntime),
  component: renderReadyToolPage(WordToPdfRuntime),
});
