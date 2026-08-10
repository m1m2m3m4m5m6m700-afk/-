import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { qrGeneratorRuntime } from "@/lib/tool-runtime/tools/qr-generator";

export const Route = createFileRoute("/tools/qr-generator")({
  head: createReadyToolHead(qrGeneratorRuntime),
  component: renderReadyToolPage(qrGeneratorRuntime),
});
