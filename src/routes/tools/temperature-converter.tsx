import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TemperatureConverterRuntime } from "@/lib/tool-runtime/tools/temperature-converter";

export const Route = createFileRoute("/tools/temperature-converter")({
  head: createReadyToolHead(TemperatureConverterRuntime),
  component: renderReadyToolPage(TemperatureConverterRuntime),
});
