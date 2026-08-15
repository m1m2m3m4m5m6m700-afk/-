import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { MetadataViewerRuntime } from "@/lib/tool-runtime/tools/metadata-viewer";

export const Route = createFileRoute("/tools/metadata-viewer")({
  head: createReadyToolHead(MetadataViewerRuntime),
  component: renderReadyToolPage(MetadataViewerRuntime),
});
