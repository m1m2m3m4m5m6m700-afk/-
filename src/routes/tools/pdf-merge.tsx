import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfMergeRuntime } from "@/lib/tool-runtime/tools/pdf-merge";

export const Route = createFileRoute("/tools/pdf-merge")({
  head: createReadyToolHead(PdfMergeRuntime),
  component: renderReadyToolPage(PdfMergeRuntime),
});
