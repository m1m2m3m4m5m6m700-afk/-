#!/usr/bin/env node
/**
 * Deprecated compatibility shim for legacy Flixo Agent commands.
 *
 * The former localization-agent validator was removed from the CI path.
 * Keep this entrypoint non-blocking for legacy `agent:*` commands while
 * delegating to the canonical localization report script.
 */
import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["scripts/report-localization.mjs"], {
  stdio: "inherit",
  encoding: "utf8",
});

// Legacy agent commands must not become a hidden CI gate again.
process.exit(result.status ?? 0);
