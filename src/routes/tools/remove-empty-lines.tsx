import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RemoveEmptyLinesRuntime } from "@/lib/tool-runtime/tools/remove-empty-lines";

export const Route = createFileRoute("/tools/remove-empty-lines")({
  head: createReadyToolHead(RemoveEmptyLinesRuntime),
  component: renderReadyToolPage(RemoveEmptyLinesRuntime),
});
