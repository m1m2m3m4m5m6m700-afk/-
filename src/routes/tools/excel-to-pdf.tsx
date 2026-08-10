import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ExcelToPdfRuntime } from "@/lib/tool-runtime/tools/excel-to-pdf";

export const Route = createFileRoute("/tools/excel-to-pdf")({
  head: createReadyToolHead(ExcelToPdfRuntime),
  component: renderReadyToolPage(ExcelToPdfRuntime),
});
