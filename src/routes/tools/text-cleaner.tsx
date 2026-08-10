import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TextCleanerRuntime } from "@/lib/tool-runtime/tools/text-cleaner";

export const Route = createFileRoute("/tools/text-cleaner")({
  head: createReadyToolHead(TextCleanerRuntime),
  component: renderReadyToolPage(TextCleanerRuntime),
});
