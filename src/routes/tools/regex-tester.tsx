import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { RegexTesterRuntime } from "@/lib/tool-runtime/tools/regex-tester";

export const Route = createFileRoute("/tools/regex-tester")({
  head: createReadyToolHead(RegexTesterRuntime),
  component: renderReadyToolPage(RegexTesterRuntime),
});
