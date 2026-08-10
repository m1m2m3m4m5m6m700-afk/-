import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { UnitConverterRuntime } from "@/lib/tool-runtime/tools/unit-converter";

export const Route = createFileRoute("/tools/unit-converter")({
  head: createReadyToolHead(UnitConverterRuntime),
  component: renderReadyToolPage(UnitConverterRuntime),
});
