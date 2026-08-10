import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { Base64ConverterRuntime } from "@/lib/tool-runtime/tools/base64-converter";

export const Route = createFileRoute("/tools/base64-converter")({
  head: createReadyToolHead(Base64ConverterRuntime),
  component: renderReadyToolPage(Base64ConverterRuntime),
});
