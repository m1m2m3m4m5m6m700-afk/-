import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TextToSpeechRuntime } from "@/lib/tool-runtime/tools/text-to-speech";

export const Route = createFileRoute("/tools/text-to-speech")({
  head: createReadyToolHead(TextToSpeechRuntime),
  component: renderReadyToolPage(TextToSpeechRuntime),
});
