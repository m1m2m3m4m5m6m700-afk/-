import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfSplitRuntime } from "@/lib/tool-runtime/tools/pdf-split";

export const Route = createFileRoute("/tools/pdf-split")({
  head: createReadyToolHead(PdfSplitRuntime),
  component: renderReadyToolPage(PdfSplitRuntime),
});
