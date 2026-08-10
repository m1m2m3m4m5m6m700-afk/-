import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { JsonValidatorRuntime } from "@/lib/tool-runtime/tools/json-validator";

export const Route = createFileRoute("/tools/json-validator")({
  head: createReadyToolHead(JsonValidatorRuntime),
  component: renderReadyToolPage(JsonValidatorRuntime),
});
