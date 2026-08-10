import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AudioCompressorRuntime } from "@/lib/tool-runtime/tools/audio-compressor";

export const Route = createFileRoute("/tools/audio-compressor")({
  head: createReadyToolHead(AudioCompressorRuntime),
  component: renderReadyToolPage(AudioCompressorRuntime),
});
