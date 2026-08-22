export type TraceContext = {
  traceId: string;
  parentTraceId?: string;
};

const TRACE_KEY = 'flixo:trace-id';

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getTraceId(): string {
  try {
    const existing = sessionStorage.getItem(TRACE_KEY);
    if (existing) return existing;
    const traceId = createTraceId();
    sessionStorage.setItem(TRACE_KEY, traceId);
    return traceId;
  } catch {
    return createTraceId();
  }
}

export function traceHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set('x-flixo-trace-id', getTraceId());
  return result;
}

export function getTraceContext(): TraceContext {
  return { traceId: getTraceId() };
}
