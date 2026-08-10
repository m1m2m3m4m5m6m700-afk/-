import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { BarcodeGeneratorRuntime } from "@/lib/tool-runtime/tools/barcode-generator";

export const Route = createFileRoute("/tools/barcode-generator")({
  head: createReadyToolHead(BarcodeGeneratorRuntime),
  component: renderReadyToolPage(BarcodeGeneratorRuntime),
});
