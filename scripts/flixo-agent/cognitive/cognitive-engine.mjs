import { diagnose } from '../diagnose.mjs';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'then',
  'error', 'failed', 'failure', 'step', 'job', 'run', 'npm', 'test',
]);

function tokens(value = '') {
  return [...new Set(
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9._/-]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  )];
}

function overlapScore(a, b) {
  const left = new Set(tokens(a));
  const right = new Set(tokens(b));
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const item of left) if (right.has(item)) common += 1;
  return common / new Set([...left, ...right]).size;
}

export function buildCognitiveAssessment({ log = '', context = {}, decisions = [] } = {}) {
  const diagnosis = diagnose(log);
  const decisionRecords = Array.isArray(decisions) ? decisions : [];

  const similarDecisions = decisionRecords
    .map((decision) => ({
      decision,
      similarity: overlapScore(log, decision.observedIssue ?? decision.diagnosis ?? ''),
    }))
    .filter(({ similarity }) => similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map(({ decision, similarity }) => ({
      id: decision.id ?? null,
      outcome: decision.outcome ?? null,
      selectedRemediation: decision.selectedRemediation ?? null,
      similarity: Number(similarity.toFixed(3)),
    }));

  const graph = context.projectGraph ?? { nodes: [], edges: [] };
  const affectedNodes = [];
  const text = String(log).toLowerCase();
  for (const node of graph.nodes ?? []) {
    const haystack = [node.id, node.name, node.path, node.tool, node.workflow].filter(Boolean).join(' ').toLowerCase();
    if (haystack && tokens(text).some((token) => haystack.includes(token))) affectedNodes.push(node);
  }

  return {
    diagnosis,
    affectedNodes,
    similarDecisions,
    dependencyImpact: {
      packageManifestChanged: /package\.json|package-lock\.json|cannot find module|cannot find package/i.test(log),
      workflowChanged: /workflow|github\/actions|\.ya?ml|windows|ubuntu/i.test(log),
    },
    deterministic: true,
  };
}

export function rankHistoricalRepairs(assessment) {
  return [...(assessment.similarDecisions ?? [])].sort((a, b) => b.similarity - a.similarity);
}
