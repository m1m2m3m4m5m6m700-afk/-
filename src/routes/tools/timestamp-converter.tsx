import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TimestampConverterRuntime } from "@/lib/tool-runtime/tools/timestamp-converter";

export const Route = createFileRoute("/tools/timestamp-converter")({
  head: createReadyToolHead(TimestampConverterRuntime),
  component: renderReadyToolPage(TimestampConverterRuntime),
});
