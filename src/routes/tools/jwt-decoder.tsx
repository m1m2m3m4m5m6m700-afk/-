import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { JwtDecoderRuntime } from "@/lib/tool-runtime/tools/jwt-decoder";

export const Route = createFileRoute("/tools/jwt-decoder")({
  head: createReadyToolHead(JwtDecoderRuntime),
  component: renderReadyToolPage(JwtDecoderRuntime),
});
