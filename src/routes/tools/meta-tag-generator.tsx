import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MetaTagGeneratorRuntime } from "@/lib/tool-runtime/tools/meta-tag-generator";

export const Route = createFileRoute("/tools/meta-tag-generator")({
  head: createReadyToolHead(MetaTagGeneratorRuntime),
  component: renderReadyToolPage(MetaTagGeneratorRuntime),
});
