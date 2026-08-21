import fs from 'node:fs';
import path from 'node:path';

const HISTORY_PATH = process.env.FLIXO_ERROR_HISTORY || path.join(process.cwd(), 'history', 'errors.jsonl');

export function appendErrorDecision(entry, filePath = HISTORY_PATH) {
  const record = {
    version: 1,
    timestamp: new Date().toISOString(),
    sha: process.env.GITHUB_SHA || null,
    ref: process.env.GITHUB_REF_NAME || null,
    runId: process.env.GITHUB_RUN_ID || null,
    ...entry,
  };
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export function readErrorHistory(filePath = HISTORY_PATH) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}
