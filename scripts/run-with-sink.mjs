import { spawn } from "node:child_process";
import { logErrorToSink } from "./error-sink.mjs";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/run-with-sink.mjs <command> [...args]");
  process.exit(2);
}

const child = spawn(command, args, {
  stdio: ["inherit", "pipe", "pipe"],
  shell: false,
  env: process.env,
  windowsHide: true,
});

let stdout = "";
let stderr = "";
const maxCapture = 12000;

child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  stdout = `${stdout}${text}`.slice(-maxCapture);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  process.stderr.write(text);
  stderr = `${stderr}${text}`.slice(-maxCapture);
});

child.on("error", (error) => {
  logErrorToSink({
    toolName: `CLI: ${command}`,
    signature: "CLI_SPAWN_FAILURE",
    rootCause: error.message,
    details: error.stack ?? String(error),
  });
  process.exit(1);
});

child.on("close", (code, signal) => {
  if (code === 0) process.exit(0);

  const output = `${stderr}\n${stdout}`;
  let signature = "CLI_EXECUTION_FAILURE";

  if (/TS\d{4}|Type error/i.test(output)) signature = "TYPECHECK_FAILURE";
  else if (/fullyParallel\s*:\s*false/i.test(output)) signature = "TEST_QUALITY_PARALLEL_CONTRACT_VIOLATION";
  else if (/lockfile mismatch|npm ci can only install/i.test(output)) signature = "LOCKFILE_DESYNC";
  else if (/ELIFECYCLE/i.test(output)) signature = "NPM_LIFECYCLE_ERROR";
  else if (/EACCES|EPERM/i.test(output)) signature = "PERMISSION_FAILURE";
  else if (/ETIMEDOUT|timed? out|timeout/i.test(output)) signature = "TIMEOUT_FAILURE";
  else if (/ENOTFOUND|ECONNRESET|ECONNREFUSED|network/i.test(output)) signature = "NETWORK_FAILURE";

  logErrorToSink({
    toolName: `CLI: ${command}`,
    signature,
    rootCause: `Command exited with ${signal ? `signal ${signal}` : `status ${code}`}`,
    details: output,
  });

  process.exit(code ?? 1);
});
