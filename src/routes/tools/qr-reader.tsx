import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { QrReaderRuntime } from "@/lib/tool-runtime/tools/qr-reader";

export const Route = createFileRoute("/tools/qr-reader")({
  head: createReadyToolHead(QrReaderRuntime),
  component: renderReadyToolPage(QrReaderRuntime),
});
