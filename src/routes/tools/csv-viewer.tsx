import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CsvViewerRuntime } from "@/lib/tool-runtime/tools/csv-viewer";

export const Route = createFileRoute("/tools/csv-viewer")({
  head: createReadyToolHead(CsvViewerRuntime),
  component: renderReadyToolPage(CsvViewerRuntime),
});
