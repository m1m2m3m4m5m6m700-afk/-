import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { HtmlEntityEncoderRuntime } from "@/lib/tool-runtime/tools/html-entity-encoder";

export const Route = createFileRoute("/tools/html-entity-encoder")({
  head: createReadyToolHead(HtmlEntityEncoderRuntime),
  component: renderReadyToolPage(HtmlEntityEncoderRuntime),
});
