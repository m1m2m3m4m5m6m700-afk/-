import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ColorConverterRuntime } from "@/lib/tool-runtime/tools/color-converter";

export const Route = createFileRoute("/tools/color-converter")({
  head: createReadyToolHead(ColorConverterRuntime),
  component: renderReadyToolPage(ColorConverterRuntime),
});
