import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { GifMakerRuntime } from "@/lib/tool-runtime/tools/gif-maker";

export const Route = createFileRoute("/tools/gif-maker")({
  head: createReadyToolHead(GifMakerRuntime),
  component: renderReadyToolPage(GifMakerRuntime),
});
