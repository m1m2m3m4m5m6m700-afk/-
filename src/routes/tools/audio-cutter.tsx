import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AudioCutterRuntime } from "@/lib/tool-runtime/tools/audio-cutter";

export const Route = createFileRoute("/tools/audio-cutter")({
  head: createReadyToolHead(AudioCutterRuntime),
  component: renderReadyToolPage(AudioCutterRuntime),
});
