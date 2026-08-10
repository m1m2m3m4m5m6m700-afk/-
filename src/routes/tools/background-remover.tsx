import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { backgroundRemoverRuntime } from "@/lib/tool-runtime/tools/background-remover";

export const Route = createFileRoute("/tools/background-remover")({
  head: createReadyToolHead(backgroundRemoverRuntime),
  component: renderReadyToolPage(backgroundRemoverRuntime),
});
