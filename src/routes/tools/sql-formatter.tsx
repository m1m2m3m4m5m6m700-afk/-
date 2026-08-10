import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SqlFormatterRuntime } from "@/lib/tool-runtime/tools/sql-formatter";

export const Route = createFileRoute("/tools/sql-formatter")({
  head: createReadyToolHead(SqlFormatterRuntime),
  component: renderReadyToolPage(SqlFormatterRuntime),
});
