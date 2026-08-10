import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AudioConverterRuntime } from "@/lib/tool-runtime/tools/audio-converter";

export const Route = createFileRoute("/tools/audio-converter")({
  head: createReadyToolHead(AudioConverterRuntime),
  component: renderReadyToolPage(AudioConverterRuntime),
});
