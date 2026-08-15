import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { FileSplitterRuntime } from "@/lib/tool-runtime/tools/file-splitter";

export const Route = createFileRoute("/tools/file-splitter")({
  head: createReadyToolHead(FileSplitterRuntime),
  component: renderReadyToolPage(FileSplitterRuntime),
});
