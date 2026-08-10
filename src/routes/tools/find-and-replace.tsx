import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { FindAndReplaceRuntime } from "@/lib/tool-runtime/tools/find-and-replace";

export const Route = createFileRoute("/tools/find-and-replace")({
  head: createReadyToolHead(FindAndReplaceRuntime),
  component: renderReadyToolPage(FindAndReplaceRuntime),
});
