import { generateForRoots } from './experimental/hypothesis-generator.mjs';
import { verifyHypothesisSet } from './core/verifier.mjs';

export function planExperiments(roots, options = {}) {
  const hypotheses = generateForRoots(roots, { max: options.maxExperimentsPerRootCause ?? 3 });
  const verification = verifyHypothesisSet(hypotheses, { branch: options.branch ?? null, apply: false });
  return { version: '4.0.0', mode: 'experimental-dry-run', hypotheses, verification, autoApply: false, requiresCIProof: true };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ?? 'playwright';
  const roots = raw.split(',').filter(Boolean).map(pattern => ({ pattern }));
  console.log(JSON.stringify(planExperiments(roots, { branch: process.env.GITHUB_HEAD_REF ?? null }), null, 2));
}
