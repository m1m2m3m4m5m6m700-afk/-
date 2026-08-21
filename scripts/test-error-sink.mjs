import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sandbox = mkdtempSync(join(tmpdir(), "flixo-error-sink-"));
process.chdir(sandbox);

const { logErrorToSink } = await import(new URL("./error-sink.mjs", import.meta.url));

const record = logErrorToSink({
  toolName: "TEST_SINK",
  severity: "WARNING",
  signature: "SINK_TEST_SIGNATURE",
  rootCause: "deterministic test",
  details: "Bearer super-secret GEMINI_API_KEY=should-not-leak",
  sha: "test-sha",
});

assert.equal(record.signature, "SINK_TEST_SIGNATURE");
assert.match(readFileSync("errors.log.json", "utf8"), /SINK_TEST_SIGNATURE/);
assert.doesNotMatch(readFileSync("errors.log.json", "utf8"), /super-secret/);
assert.match(readFileSync("DECISION_LOG.md", "utf8"), /test-sha/);

rmSync(sandbox, { recursive: true, force: true });
console.log("PASS: error sink writes structured evidence and redacts secrets");
