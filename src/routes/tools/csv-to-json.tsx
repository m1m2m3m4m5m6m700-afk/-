import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CsvToJsonRuntime } from "@/lib/tool-runtime/tools/csv-to-json";

export const Route = createFileRoute("/tools/csv-to-json")({
  head: createReadyToolHead(CsvToJsonRuntime),
  component: renderReadyToolPage(CsvToJsonRuntime),
});
