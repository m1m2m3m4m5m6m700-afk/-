import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { WordFrequencyRuntime } from "@/lib/tool-runtime/tools/word-frequency";

export const Route = createFileRoute("/tools/word-frequency")({
  head: createReadyToolHead(WordFrequencyRuntime),
  component: renderReadyToolPage(WordFrequencyRuntime),
});
