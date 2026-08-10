import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RandomNameRuntime } from "@/lib/tool-runtime/tools/random-name";

export const Route = createFileRoute("/tools/random-name")({
  head: createReadyToolHead(RandomNameRuntime),
  component: renderReadyToolPage(RandomNameRuntime),
});
