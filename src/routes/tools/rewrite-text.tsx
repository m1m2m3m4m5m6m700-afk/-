import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RewriteTextRuntime } from "@/lib/tool-runtime/tools/rewrite-text";

export const Route = createFileRoute("/tools/rewrite-text")({
  head: createReadyToolHead(RewriteTextRuntime),
  component: renderReadyToolPage(RewriteTextRuntime),
});
