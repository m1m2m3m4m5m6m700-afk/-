import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { LoremIpsumRuntime } from "@/lib/tool-runtime/tools/lorem-ipsum";

export const Route = createFileRoute("/tools/lorem-ipsum")({
  head: createReadyToolHead(LoremIpsumRuntime),
  component: renderReadyToolPage(LoremIpsumRuntime),
});
