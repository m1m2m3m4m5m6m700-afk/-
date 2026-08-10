import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { YamlFormatterRuntime } from "@/lib/tool-runtime/tools/yaml-formatter";

export const Route = createFileRoute("/tools/yaml-formatter")({
  head: createReadyToolHead(YamlFormatterRuntime),
  component: renderReadyToolPage(YamlFormatterRuntime),
});
