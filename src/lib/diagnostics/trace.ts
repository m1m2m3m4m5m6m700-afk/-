export type TraceContext = {
  traceId: string;
  parentTraceId?: string;
  traceparent: string;
};

const TRACE_KEY = 'flixo:trace-id';

function createTraceId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().replaceAll('-', '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.padEnd(32, '0').slice(0, 32);
}

function createSpanId(): string {
  return createTraceId().slice(0, 16);
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

export function getTraceparent(): string {
  return `00-${getTraceId()}-${createSpanId()}-01`;
}

export function traceHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set('x-flixo-trace-id', getTraceId());
  result.set('traceparent', getTraceparent());
  return result;
}

export function getTraceContext(): TraceContext {
  return { traceId: getTraceId(), traceparent: getTraceparent() };
}

export function recordSpan(name: string, attributes: Record<string, string | number | boolean> = {}) {
  if (typeof performance === 'undefined') return;
  performance.mark(`flixo:${name}:start`);
  return (status: 'ok' | 'error' = 'ok') => {
    const end = `flixo:${name}:end`;
    performance.mark(end);
    try {
      const measure = performance.measure(`flixo:${name}`, `flixo:${name}:start`, end);
      console.info(JSON.stringify({ level: 'info', event: 'trace.span', name, traceId: getTraceId(), status, durationMs: Math.round(measure.duration * 100) / 100, attributes }));
    } finally {
      performance.clearMarks(`flixo:${name}:start`);
      performance.clearMarks(end);
      performance.clearMeasures(`flixo:${name}`);
    }
  };
}
