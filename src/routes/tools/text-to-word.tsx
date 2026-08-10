import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TextToWordRuntime } from "@/lib/tool-runtime/tools/text-to-word";

export const Route = createFileRoute("/tools/text-to-word")({
  head: createReadyToolHead(TextToWordRuntime),
  component: renderReadyToolPage(TextToWordRuntime),
});
