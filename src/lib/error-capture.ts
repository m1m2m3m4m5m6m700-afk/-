import { AsyncLocalStorage } from "node:async_hooks";

type CaptureStore = {
  description?: string;
};

const captureStorage = new AsyncLocalStorage<CaptureStore>();
const CAUSE_DEPTH_LIMIT = 5;
const DESCRIPTION_LENGTH_LIMIT = 4_000;

const SENSITIVE_VALUE_PATTERNS = [
  /((?:authorization|cookie)\s*[:=]\s*(?:bearer\s+)?)[^\s,;]+/gi,
  /((?:api[_ -]?key|secret|password|passwd|token)\s*[:=]\s*)[^\s,;]+/gi,
  /(postgres(?:ql)?:\/\/[^/\s:]+:)[^@\s]+(@)/gi,
];

function redactSensitive(value: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce(
    (result, pattern) => result.replace(pattern, "$1[REDACTED]$2"),
    value,
  );
}

function record(error: unknown) {
  const store = captureStorage.getStore();
  if (store) store.description = describeError(error);
}

/**
 * Describe only safe, bounded error metadata. Raw error objects and stack
 * traces are never retained across requests or forwarded to the log pipeline.
 */
export function describeError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;

  for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
    if (!(current instanceof Error)) {
      parts.push(typeof current === "string" ? redactSensitive(current) : safeStringify(current));
      break;
    }

    const label = depth === 0 ? "" : "caused by: ";
    const status = describeStatus(current);
    parts.push(`${label}${current.name}: ${redactSensitive(current.message)}${status}`);
    current = current.cause;
  }

  return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}

function describeStatus(error: Error): string {
  const { status, statusCode } = error as { status?: unknown; statusCode?: unknown };
  const value = status ?? statusCode;
  return typeof value === "number" ? ` (status ${value})` : "";
}

function safeStringify(value: unknown): string {
  try {
    return redactSensitive(JSON.stringify(value) ?? String(value));
  } catch {
    return "[Unserializable error]";
  }
}

function isErrorLike(value: unknown): value is Error {
  return value instanceof Error;
}

// h3 may report swallowed SSR failures through console.error. Capture only a
// sanitized description in the active request context so concurrent requests
// cannot overwrite one another.
const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const expanded = args.map((arg) => {
    if (isErrorLike(arg)) {
      record(arg);
      return describeError(arg);
    }
    return typeof arg === "string" ? redactSensitive(arg) : arg;
  });
  originalConsoleError(...expanded);
};

export function runWithErrorCapture<T>(callback: () => Promise<T>): Promise<T> {
  return captureStorage.run({}, callback);
}

export function consumeLastCapturedError(): string | undefined {
  const store = captureStorage.getStore();
  const description = store?.description;
  if (store) store.description = undefined;
  return description;
}
