import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PowerpointToPdfRuntime } from "@/lib/tool-runtime/tools/powerpoint-to-pdf";

export const Route = createFileRoute("/tools/powerpoint-to-pdf")({
  head: createReadyToolHead(PowerpointToPdfRuntime),
  component: renderReadyToolPage(PowerpointToPdfRuntime),
});
