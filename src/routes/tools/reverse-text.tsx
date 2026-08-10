import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ReverseTextRuntime } from "@/lib/tool-runtime/tools/reverse-text";

export const Route = createFileRoute("/tools/reverse-text")({
  head: createReadyToolHead(ReverseTextRuntime),
  component: renderReadyToolPage(ReverseTextRuntime),
});
