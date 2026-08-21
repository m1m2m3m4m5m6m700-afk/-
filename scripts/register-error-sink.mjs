import { logErrorToSink } from "./error-sink.mjs";

let recorded = false;

function recordOnce(payload) {
  if (recorded) return;
  recorded = true;
  try {
    logErrorToSink(payload);
  } catch (error) {
    console.error("[ERROR SINK] interceptor failure:", error instanceof Error ? error.message : String(error));
  }
}

process.on("uncaughtException", (error) => {
  recordOnce({
    toolName: "NODE_RUNTIME",
    severity: "CRITICAL",
    signature: "UNCAUGHT_EXCEPTION",
    rootCause: error instanceof Error ? error.message : String(error),
    details: error instanceof Error ? error.stack ?? error.message : String(error),
  });
  process.exitCode = 1;
});

process.on("unhandledRejection", (reason) => {
  recordOnce({
    toolName: "NODE_RUNTIME",
    severity: "CRITICAL",
    signature: "UNHANDLED_REJECTION",
    rootCause: reason instanceof Error ? reason.message : String(reason),
    details: reason instanceof Error ? reason.stack ?? reason.message : String(reason),
  });
  process.exitCode = 1;
});
