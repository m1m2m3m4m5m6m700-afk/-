import fs from 'node:fs/promises';
import path from 'node:path';
import { buildProjectGraph } from './project-graph.mjs';
import { getDecisionLog, findSimilarDecisions } from './decision-log.mjs';

const DEFAULT_FILES = [
  'docs/AI-ASSISTANT-PROMPT.md',
  'docs/AI-ASSISTANT-PROMPT-V2.md',
  'package.json',
  'package-lock.json',
  'scripts/certification/validate-baseline.mjs',
  'scripts/certification/validate-baseline-schema.mjs',
  'scripts/certification/schemas/baseline.schema.json',
  'scripts/certification/schemas/gate-manifest.schema.json',
  'docs/CERTIFICATION-POLICY.md',
];

function repoRoot() {
  return process.env.FLIXO_REPO_ROOT || process.cwd();
}

async function readIfExists(relativePath) {
  const fullPath = path.join(repoRoot(), relativePath);
  try {
    return await fs.readFile(fullPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export async function collectRepositoryContext({ files = DEFAULT_FILES, failureQuery = null } = {}) {
  const entries = {};
  for (const file of files) entries[file] = await readIfExists(file);

  const projectGraph = await buildProjectGraph();
  const recentDecisions = await getDecisionLog({ limit: 25 });
  const similarDecisions = failureQuery ? await findSimilarDecisions(failureQuery, { limit: 10 }) : [];

  return {
    repositoryRoot: repoRoot(),
    sha: process.env.GITHUB_SHA || null,
    files: entries,
    projectGraph,
    memory: {
      recentDecisions,
      similarDecisions,
    },
    environment: {
      node: process.version,
      platform: process.platform,
      ci: process.env.CI === 'true',
    },
  };
}

export function summarizeFailure(log = '') {
  const lines = String(log).split(/\r?\n/).filter(Boolean);
  return lines.slice(-80).join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const context = await collectRepositoryContext({ failureQuery: process.argv.slice(2).join(' ') || null });
  process.stdout.write(JSON.stringify(context, null, 2) + '\n');
}
