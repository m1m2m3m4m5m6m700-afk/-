import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { UrlEncoderRuntime } from "@/lib/tool-runtime/tools/url-encoder";

export const Route = createFileRoute("/tools/url-encoder")({
  head: createReadyToolHead(UrlEncoderRuntime),
  component: renderReadyToolPage(UrlEncoderRuntime),
});
