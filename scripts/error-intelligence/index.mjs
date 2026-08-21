import fs from 'node:fs';
import { parseLog } from './providers/nlp-parser.mjs';
import { callConfiguredProvider } from './providers/ai-connector.mjs';
import { generateSignature } from './core/signature-generator.mjs';
import { analyzeRootCause } from './core/root-cause-analyzer.mjs';
import { buildDebugReport } from './core/contextual-debugger.mjs';
import { appendErrorDecision } from './core/decision-log.mjs';
import { summarizeTrends, renderDashboard } from './core/trend-dashboard.mjs';

export async function analyzeError(log, options = {}) {
  const parsed = await parseLog(log, options);
  const signature = generateSignature({ ...parsed, dependencyContext: options.dependencyContext });
  const rootCause = analyzeRootCause({ ...parsed, log, dependencyContext: options.dependencyContext });
  const contextual = buildDebugReport({ signature, parsed, rootCause, baseline: options.baseline, commit: options.commit });
  const provider = parsed.errorType === 'UNKNOWN' ? await callConfiguredProvider(log, { parsed, signature, rootCause }) : { enabled: false, reason: 'Deterministic diagnosis available.' };
  const record = appendErrorDecision({ signature: signature.signature, parsed, rootCause, debugReport: contextual, provider: provider.enabled ? provider : null, outcome: 'diagnosed' });
  return { parsed, signature, rootCause, debugReport: contextual, provider, record };
}

export function loadLog(input) {
  return fs.readFileSync(input, 'utf8');
}

export function dashboard(records) {
  const summary = summarizeTrends(records);
  return { summary, markdown: renderDashboard(summary) };
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node scripts/error-intelligence/index.mjs <log-file>');
  const result = await analyzeError(loadLog(input));
  console.log(JSON.stringify(result, null, 2));
}
