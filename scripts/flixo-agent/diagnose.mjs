const PATTERNS = [
  {
    id: 'typescript',
    layer: 'TYPECHECK',
    priority: 100,
    expression: /TS\d{4}|typescript|tsc.*(?:error|failed)/i,
  },
  {
    id: 'lockfile',
    layer: 'DEPENDENCY',
    priority: 90,
    expression: /package-lock\.json|ERESOLVE|npm ci.*(?:failed|error)|lockfile.*(?:mismatch|invalid|out of sync)/i,
  },
  {
    id: 'playwright',
    layer: 'WORKFLOW',
    priority: 80,
    expression: /playwright|chrome-headless-shell|Timeout.*exceeded|browser.*missing/i,
  },
  {
    id: 'baseline',
    layer: 'CONTRACT',
    priority: 70,
    expression: /baseline\.(?:certifiedCommit|certification\.commit)|baseline.*(?:contract|schema|validation)/i,
  },
  {
    id: 'lint',
    layer: 'LINT',
    priority: 60,
    expression: /eslint|lint.*(?:error|failed)/i,
  },
  {
    id: 'build',
    layer: 'BUILD',
    priority: 50,
    expression: /vite build|build.*(?:error|failed)/i,
  },
  {
    id: 'workflow',
    layer: 'WORKFLOW',
    priority: 40,
    expression: /github\/actions|workflow|\.ya?ml/i,
  },
  {
    id: 'jsqr',
    layer: 'DEPENDENCY',
    priority: 30,
    expression: /jsqr|Cannot find module\s+['\"]jsqr['\"]|QR Node Matrix/i,
  },
  {
    id: 'arabic',
    layer: 'LOCALIZATION',
    priority: 10,
    expression: /(?:arabic|العربية|locale.*(?:ar|ar-EG)|localization|i18n(?:\s+(?:error|failed))?)/i,
  },
];

export function diagnose(log = '') {
  const text = String(log);
  const matches = PATTERNS
    .filter((pattern) => pattern.expression.test(text))
    .sort((left, right) => right.priority - left.priority);
  const match = matches[0];

  if (!match) {
    return {
      known: false,
      knownPattern: null,
      layer: 'UNKNOWN',
      confidence: 0,
      reason: 'No deterministic error signature matched.',
    };
  }

  return {
    known: true,
    knownPattern: match.id,
    layer: match.layer,
    confidence: match.id === 'lockfile' || match.id === 'jsqr' ? 0.95 : 0.9,
    reason: `Matched deterministic signature: ${match.id}`,
  };
}

export function knownPatterns() {
  return PATTERNS.map(({ id, layer, priority }) => ({ id, layer, priority }));
}
