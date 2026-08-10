import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CaseConverterRuntime } from "@/lib/tool-runtime/tools/case-converter";

export const Route = createFileRoute("/tools/case-converter")({
  head: createReadyToolHead(CaseConverterRuntime),
  component: renderReadyToolPage(CaseConverterRuntime),
});
