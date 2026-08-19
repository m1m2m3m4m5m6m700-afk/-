import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_LOG = 'state/cognitive/decision-log.json';

function repoRoot() { return process.env.FLIXO_REPO_ROOT || process.cwd(); }
function logPath(relativePath = DEFAULT_LOG) { return path.join(repoRoot(), relativePath); }

async function readEntries(relativePath = DEFAULT_LOG) {
  try {
    const parsed = JSON.parse(await fs.readFile(logPath(relativePath), 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Decision log must be an array.');
    return parsed;
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

export async function appendDecision(decision, relativePath = DEFAULT_LOG) {
  const entries = await readEntries(relativePath);
  const entry = {
    schemaVersion: 1,
    id: decision.id ?? `decision-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: decision.timestamp ?? new Date().toISOString(),
    sha: decision.sha ?? process.env.GITHUB_SHA ?? null,
    actor: decision.actor ?? 'flixo-agent',
    action: decision.action ?? 'unknown',
    category: decision.category ?? 'UNKNOWN',
    issue: decision.issue ?? null,
    diagnosis: decision.diagnosis ?? null,
    alternatives: Array.isArray(decision.alternatives) ? decision.alternatives : [],
    selected: decision.selected ?? null,
    rationale: decision.rationale ?? null,
    evidence: Array.isArray(decision.evidence) ? decision.evidence : [],
    risk: decision.risk ?? { level: 'UNKNOWN', factors: [] },
    outcome: decision.outcome ?? { status: 'PENDING' },
  };
  const target = logPath(relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify([...entries, entry], null, 2) + '\n');
  return entry;
}

export async function findSimilarDecisions(query, { limit = 10, relativePath = DEFAULT_LOG } = {}) {
  const entries = await readEntries(relativePath);
  const terms = String(query ?? '').toLowerCase().split(/[^a-z0-9_-]+/).filter(Boolean);
  return entries
    .map((entry) => {
      const haystack = JSON.stringify(entry).toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { ...entry, similarity: terms.length ? score / terms.length : 0 };
    })
    .filter((entry) => entry.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity || String(b.timestamp).localeCompare(String(a.timestamp)))
    .slice(0, limit);
}

export async function getDecisionLog({ limit = 50, relativePath = DEFAULT_LOG } = {}) {
  const entries = await readEntries(relativePath);
  return entries.slice(-limit);
}
