import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { JsonFormatterRuntime } from "@/lib/tool-runtime/tools/json-formatter";

export const Route = createFileRoute("/tools/json-formatter")({
  head: createReadyToolHead(JsonFormatterRuntime),
  component: renderReadyToolPage(JsonFormatterRuntime),
});
