import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ZipCreatorRuntime } from "@/lib/tool-runtime/tools/zip-creator";

export const Route = createFileRoute("/tools/zip-creator")({
  head: createReadyToolHead(ZipCreatorRuntime),
  component: renderReadyToolPage(ZipCreatorRuntime),
});
