import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfCompressRuntime } from "@/lib/tool-runtime/tools/pdf-compress";

export const Route = createFileRoute("/tools/pdf-compress")({
  head: createReadyToolHead(PdfCompressRuntime),
  component: renderReadyToolPage(PdfCompressRuntime),
});
