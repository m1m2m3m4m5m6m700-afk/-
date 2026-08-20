import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const defaultPath = path.join(root, '.github', 'self-healing', 'logs', 'decision-log.jsonl');

export function appendDecision(event, filePath = process.env.FLIXO_DECISION_LOG || defaultPath) {
  const entry = {
    timestamp: new Date().toISOString(),
    sha: process.env.GITHUB_SHA || null,
    ref: process.env.GITHUB_REF_NAME || null,
    runId: process.env.GITHUB_RUN_ID || process.env.RUN_ID || null,
    ...event,
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}
