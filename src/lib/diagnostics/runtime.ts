import { getTraceId } from './trace';
import { createDiagnosticFingerprint, type DiagnosticStage } from './fingerprint';

export type RuntimeDiagnostic = {
  kind: 'error' | 'unhandledrejection' | 'hydration';
  stage: DiagnosticStage;
  message: string;
  stack?: string;
  route: string;
  userAgent: string;
  timestamp: string;
  traceId: string;
  eventId: string;
  fingerprint: string;
  componentStack?: string;
};

const STORAGE_KEY = 'flixo:runtime-diagnostics';
const MAX_ENTRIES = 40;
let sequence = 0;

function createEventId(): string {
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence.toString(36)}`;
}

function saveDiagnostic(diagnostic: RuntimeDiagnostic): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as RuntimeDiagnostic[]) : [];
    current.push(diagnostic);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(-MAX_ENTRIES)));
  } catch {
    // Diagnostics must never break the application.
  }
}

export function getRuntimeDiagnostics(): RuntimeDiagnostic[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RuntimeDiagnostic[]) : [];
  } catch {
    return [];
  }
}

export function clearRuntimeDiagnostics(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Diagnostics must never break the application.
  }
}

function record(
  kind: RuntimeDiagnostic['kind'],
  error: unknown,
  componentStack?: string,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const route = `${window.location.pathname}${window.location.search}`;
  const diagnostic: RuntimeDiagnostic = {
    kind,
    stage: kind === 'hydration' ? 'router' : 'ui',
    message,
    stack: error instanceof Error ? error.stack : undefined,
    route,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    traceId: getTraceId(),
    eventId: createEventId(),
    fingerprint: createDiagnosticFingerprint({ kind, stage: kind === 'hydration' ? 'router' : 'ui', message, route }),
    componentStack,
  };

  saveDiagnostic(diagnostic);
}

export function recordHydrationError(error: unknown, componentStack?: string): void {
  record('hydration', error, componentStack);
}

export function installRuntimeDiagnostics(): () => void {
  const onError = (event: ErrorEvent) => record('error', event.error ?? event.message);
  const onRejection = (event: PromiseRejectionEvent) => record('unhandledrejection', event.reason);

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
