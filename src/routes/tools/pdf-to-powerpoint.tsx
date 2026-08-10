import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfToPowerpointRuntime } from "@/lib/tool-runtime/tools/pdf-to-powerpoint";

export const Route = createFileRoute("/tools/pdf-to-powerpoint")({
  head: createReadyToolHead(PdfToPowerpointRuntime),
  component: renderReadyToolPage(PdfToPowerpointRuntime),
});
