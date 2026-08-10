import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfProtectRuntime } from "@/lib/tool-runtime/tools/pdf-protect";

export const Route = createFileRoute("/tools/pdf-protect")({
  head: createReadyToolHead(PdfProtectRuntime),
  component: renderReadyToolPage(PdfProtectRuntime),
});
