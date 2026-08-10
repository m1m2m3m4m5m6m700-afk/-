import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { JpgToPdfRuntime } from "@/lib/tool-runtime/tools/jpg-to-pdf";

export const Route = createFileRoute("/tools/jpg-to-pdf")({
  head: createReadyToolHead(JpgToPdfRuntime),
  component: renderReadyToolPage(JpgToPdfRuntime),
});
