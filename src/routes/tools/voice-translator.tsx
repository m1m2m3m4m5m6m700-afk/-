import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { VoiceTranslatorRuntime } from "@/lib/tool-runtime/tools/voice-translator";

export const Route = createFileRoute("/tools/voice-translator")({
  head: createReadyToolHead(VoiceTranslatorRuntime),
  component: renderReadyToolPage(VoiceTranslatorRuntime),
});
