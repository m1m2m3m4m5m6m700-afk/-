import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { SlugGeneratorRuntime } from "@/lib/tool-runtime/tools/slug-generator";

export const Route = createFileRoute("/tools/slug-generator")({
  head: createReadyToolHead(SlugGeneratorRuntime),
  component: renderReadyToolPage(SlugGeneratorRuntime),
});
