import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PdfUnlockRuntime } from "@/lib/tool-runtime/tools/pdf-unlock";

export const Route = createFileRoute("/tools/pdf-unlock")({
  head: createReadyToolHead(PdfUnlockRuntime),
  component: renderReadyToolPage(PdfUnlockRuntime),
});
