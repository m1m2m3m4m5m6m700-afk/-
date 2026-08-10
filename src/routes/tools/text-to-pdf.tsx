import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { TextToPdfRuntime } from "@/lib/tool-runtime/tools/text-to-pdf";

export const Route = createFileRoute("/tools/text-to-pdf")({
  head: createReadyToolHead(TextToPdfRuntime),
  component: renderReadyToolPage(TextToPdfRuntime),
});
