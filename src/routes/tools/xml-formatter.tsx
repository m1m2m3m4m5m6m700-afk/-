import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { XmlFormatterRuntime } from "@/lib/tool-runtime/tools/xml-formatter";

export const Route = createFileRoute("/tools/xml-formatter")({
  head: createReadyToolHead(XmlFormatterRuntime),
  component: renderReadyToolPage(XmlFormatterRuntime),
});
