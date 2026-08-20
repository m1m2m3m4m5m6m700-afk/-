import { createHash } from "node:crypto";
import type { FailureMemoryInput } from "./types";

function normalizeCode(value: string | undefined): string {
  return (value ?? "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_.:-]/g, "");
}

export function buildFailureSignature(input: FailureMemoryInput): string {
  const canonical = [
    input.taskId,
    input.kind,
    input.retryable ? "retryable" : "terminal",
    normalizeCode(input.diagnosticCode),
  ].join("|");

  return createHash("sha256").update(canonical, "utf8").digest("hex").slice(0, 24);
}
