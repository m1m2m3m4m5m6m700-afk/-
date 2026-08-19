const RULES = [
  { id: 'playwright', category: 'ENVIRONMENT', pattern: /Executable doesn't exist.*(chromium|chrome-headless-shell)|browserType\.launch/i },
  { id: 'jsqr', category: 'DEPENDENCY', pattern: /Cannot find (?:module|package).*jsqr/i },
  { id: 'baseline', category: 'CONTRACT', pattern: /certification commit mismatch|baseline expired|baseline.*invalid expiry/i },
  { id: 'workflow', category: 'WORKFLOW', pattern: /QR.*Windows|Windows.*QR|workflow/i },
  { id: 'external', category: 'EXTERNAL', pattern: /api-deployments-free-per-day|deployment.*limit/i },
];

export function diagnose(log = '') {
  const match = RULES.find((rule) => rule.pattern.test(String(log)));
  if (!match) return { known: false, category: 'UNKNOWN', pattern: null, summary: 'Unknown failure.' };
  return { known: true, category: match.category, pattern: match.id, summary: `Matched ${match.id}.` };
}
