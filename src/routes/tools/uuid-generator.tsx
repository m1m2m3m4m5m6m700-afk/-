import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { UuidGeneratorRuntime } from "@/lib/tool-runtime/tools/uuid-generator";

export const Route = createFileRoute("/tools/uuid-generator")({
  head: createReadyToolHead(UuidGeneratorRuntime),
  component: renderReadyToolPage(UuidGeneratorRuntime),
});
