import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { AiWriterRuntime } from "@/lib/tool-runtime/tools/ai-writer";

export const Route = createFileRoute("/tools/ai-writer")({
  head: createReadyToolHead(AiWriterRuntime),
  component: renderReadyToolPage(AiWriterRuntime),
});
