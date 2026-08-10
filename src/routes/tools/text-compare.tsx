import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TextCompareRuntime } from "@/lib/tool-runtime/tools/text-compare";

export const Route = createFileRoute("/tools/text-compare")({
  head: createReadyToolHead(TextCompareRuntime),
  component: renderReadyToolPage(TextCompareRuntime),
});
