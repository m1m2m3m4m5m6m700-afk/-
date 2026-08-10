import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RandomNumberRuntime } from "@/lib/tool-runtime/tools/random-number";

export const Route = createFileRoute("/tools/random-number")({
  head: createReadyToolHead(RandomNumberRuntime),
  component: renderReadyToolPage(RandomNumberRuntime),
});
