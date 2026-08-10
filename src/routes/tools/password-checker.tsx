import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { PasswordCheckerRuntime } from "@/lib/tool-runtime/tools/password-checker";

export const Route = createFileRoute("/tools/password-checker")({
  head: createReadyToolHead(PasswordCheckerRuntime),
  component: renderReadyToolPage(PasswordCheckerRuntime),
});
