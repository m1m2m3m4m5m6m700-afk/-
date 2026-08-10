import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { WatermarkRemoverRuntime } from "@/lib/tool-runtime/tools/watermark-remover";

export const Route = createFileRoute("/tools/watermark-remover")({
  head: createReadyToolHead(WatermarkRemoverRuntime),
  component: renderReadyToolPage(WatermarkRemoverRuntime),
});
