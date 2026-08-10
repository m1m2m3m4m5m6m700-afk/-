import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfEditRuntime } from "@/lib/tool-runtime/tools/pdf-edit";

export const Route = createFileRoute("/tools/pdf-edit")({
  head: createReadyToolHead(PdfEditRuntime),
  component: renderReadyToolPage(PdfEditRuntime),
});
