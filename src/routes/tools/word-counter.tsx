import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { WordCounterRuntime } from "@/lib/tool-runtime/tools/word-counter";

export const Route = createFileRoute("/tools/word-counter")({
  head: createReadyToolHead(WordCounterRuntime),
  component: renderReadyToolPage(WordCounterRuntime),
});
