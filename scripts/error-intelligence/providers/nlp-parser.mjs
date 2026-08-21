import { readLog } from '../core/log-reader.mjs';

export function parseLogDeterministically(log) {
  return readLog(log);
}

export async function parseLog(log, { aiProvider } = {}) {
  const deterministic = parseLogDeterministically(log);
  if (deterministic.errorType !== 'UNKNOWN' || !aiProvider) return deterministic;
  return aiProvider(log, deterministic);
}
