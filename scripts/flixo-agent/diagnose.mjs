const PATTERNS = [
  {
    id: 'lockfile',
    layer: 'DEPENDENCY',
    expression: /package-lock\.json|npm ci|ERESOLVE|lockfile|cannot find module|cannot find package/i,
  },
  {
    id: 'jsqr',
    layer: 'DEPENDENCY',
    expression: /jsqr|Cannot find module.*qrcode|QR Node Matrix/i,
  },
  {
    id: 'playwright',
    layer: 'WORKFLOW',
    expression: /playwright|chrome-headless-shell|Timeout.*exceeded|browser.*missing/i,
  },
  {
    id: 'baseline',
    layer: 'CONTRACT',
    expression: /baseline\.(?:certifiedCommit|certification\.commit)|baseline.*(?:contract|schema|validation)/i,
  },
  {
    id: 'arabic',
    layer: 'LOCALIZATION',
    expression: /arabic|العربية|locale.*(?:ar|ar-EG)|i18n|localization/i,
  },
  {
    id: 'typescript',
    layer: 'TYPECHECK',
    expression: /TS\d{4}|typescript|tsc.*(?:error|failed)/i,
  },
  {
    id: 'lint',
    layer: 'LINT',
    expression: /eslint|lint.*(?:error|failed)/i,
  },
  {
    id: 'build',
    layer: 'BUILD',
    expression: /vite build|build.*(?:error|failed)/i,
  },
  {
    id: 'workflow',
    layer: 'WORKFLOW',
    expression: /github\/actions|workflow|\.ya?ml/i,
  },
];

export function diagnose(log = '') {
  const text = String(log);
  const match = PATTERNS.find((pattern) => pattern.expression.test(text));
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
  return PATTERNS.map(({ id, layer }) => ({ id, layer }));
}
