import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SortLinesRuntime } from "@/lib/tool-runtime/tools/sort-lines";

export const Route = createFileRoute("/tools/sort-lines")({
  head: createReadyToolHead(SortLinesRuntime),
  component: renderReadyToolPage(SortLinesRuntime),
});
