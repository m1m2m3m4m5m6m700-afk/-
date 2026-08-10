import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RemoveDuplicateLinesRuntime } from "@/lib/tool-runtime/tools/remove-duplicate-lines";

export const Route = createFileRoute("/tools/remove-duplicate-lines")({
  head: createReadyToolHead(RemoveDuplicateLinesRuntime),
  component: renderReadyToolPage(RemoveDuplicateLinesRuntime),
});
