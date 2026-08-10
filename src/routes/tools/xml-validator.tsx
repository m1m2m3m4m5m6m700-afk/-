import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { XmlValidatorRuntime } from "@/lib/tool-runtime/tools/xml-validator";

export const Route = createFileRoute("/tools/xml-validator")({
  head: createReadyToolHead(XmlValidatorRuntime),
  component: renderReadyToolPage(XmlValidatorRuntime),
});
