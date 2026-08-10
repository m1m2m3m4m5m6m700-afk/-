import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { passwordGeneratorRuntime } from "@/lib/tool-runtime/tools/password-generator";

export const Route = createFileRoute("/tools/password-generator")({
  head: createReadyToolHead(passwordGeneratorRuntime),
  component: renderReadyToolPage(passwordGeneratorRuntime),
});
