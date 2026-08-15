import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ArchiveExtractorRuntime } from "@/lib/tool-runtime/tools/archive-extractor";

export const Route = createFileRoute("/tools/archive-extractor")({
  head: createReadyToolHead(ArchiveExtractorRuntime),
  component: renderReadyToolPage(ArchiveExtractorRuntime),
});
