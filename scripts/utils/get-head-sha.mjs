import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const SHA_RE = /^[0-9a-f]{40}$/i;
function valid(value) {
  return typeof value === "string" && SHA_RE.test(value.trim()) ? value.trim() : null;
}

export function getExactHeadSha() {
  const explicit = valid(process.env.GITHUB_PR_HEAD_SHA);
  if (explicit) return explicit;

  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && existsSync(eventPath)) {
    try {
      const event = JSON.parse(readFileSync(eventPath, "utf8"));
      const prHead = valid(event?.pull_request?.head?.sha);
      if (prHead) return prHead;
    } catch {}
  }

  try {
    return valid(execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" })) ?? "UNKNOWN_SHA";
  } catch {
    return "UNKNOWN_SHA";
  }
}
