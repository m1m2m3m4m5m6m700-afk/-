import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { BackgroundChangerRuntime } from "@/lib/tool-runtime/tools/background-changer";

export const Route = createFileRoute("/tools/background-changer")({
  head: createReadyToolHead(BackgroundChangerRuntime),
  component: renderReadyToolPage(BackgroundChangerRuntime),
});
