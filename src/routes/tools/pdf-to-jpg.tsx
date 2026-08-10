import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfToJpgRuntime } from "@/lib/tool-runtime/tools/pdf-to-jpg";

export const Route = createFileRoute("/tools/pdf-to-jpg")({
  head: createReadyToolHead(PdfToJpgRuntime),
  component: renderReadyToolPage(PdfToJpgRuntime),
});
