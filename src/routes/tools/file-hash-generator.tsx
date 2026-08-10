import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { FileHashGeneratorRuntime } from "@/lib/tool-runtime/tools/file-hash-generator";

export const Route = createFileRoute("/tools/file-hash-generator")({
  head: createReadyToolHead(FileHashGeneratorRuntime),
  component: renderReadyToolPage(FileHashGeneratorRuntime),
});
