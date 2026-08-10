import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { CronParserRuntime } from "@/lib/tool-runtime/tools/cron-parser";

export const Route = createFileRoute("/tools/cron-parser")({
  head: createReadyToolHead(CronParserRuntime),
  component: renderReadyToolPage(CronParserRuntime),
});
