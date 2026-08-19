const PROTECTED_FILES = new Set(['.github/workflows/release-certification.yml']);

export function verifyHypothesis(hypothesis, { branch = null, apply = false } = {}) {
  const errors = [];
  if (!hypothesis?.experimentId) errors.push('missing experimentId');
  if (!hypothesis?.requiresSandbox) errors.push('hypothesis must require sandbox');
  if (!hypothesis?.requiresCIProof) errors.push('hypothesis must require CI proof');
  if (hypothesis?.autoApply) errors.push('autoApply is forbidden for v4 hypotheses');
  if (branch === 'main') errors.push('main is protected');
  if (apply) errors.push('v4 hypothesis verifier is dry-run only');
  for (const change of hypothesis?.changes ?? []) {
    if (PROTECTED_FILES.has(change.file)) errors.push(`protected file: ${change.file}`);
    if (change.file.includes('..') || change.file.startsWith('/')) errors.push(`unsafe path: ${change.file}`);
    if (change.file === 'package.json' && change.type === 'dependency-sync' && !['dev', 'runtime'].includes(change.scope)) errors.push('dependency scope must be dev or runtime');
  }
  return { valid: errors.length === 0, errors };
}

export function verifyHypothesisSet(hypotheses, options = {}) {
  if (!Array.isArray(hypotheses) || hypotheses.length === 0) return { valid: false, errors: ['no hypotheses'] };
  if (hypotheses.length > 3) return { valid: false, errors: ['maximum 3 hypotheses exceeded'] };
  const results = hypotheses.map(h => ({ experimentId: h.experimentId, ...verifyHypothesis(h, options) }));
  return { valid: results.every(r => r.valid), results, errors: results.flatMap(r => r.errors.map(e => `${r.experimentId}: ${e}`)) };
}
