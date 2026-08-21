import crypto from 'node:crypto';

function normalize(value = '') {
  return String(value)
    .replace(/\b0x[0-9a-f]+\b/gi, '0x#')
    .replace(/\b\d+\b/g, '#')
    .replace(/\/home\/[^\s:]+/g, '<path>')
    .replace(/[A-F0-9]{7,40}/g, '<sha>')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function generateSignature({ errorType = 'UNKNOWN', errorMessage = '', affectedFile = null, dependencyContext = {} } = {}) {
  const seed = JSON.stringify({
    errorType,
    errorMessage: normalize(errorMessage),
    affectedFile: affectedFile ? String(affectedFile).split('/').pop() : null,
    dependencyContext: {
      packageName: dependencyContext.packageName ?? null,
      packageVersion: dependencyContext.packageVersion ?? null,
      lockfileChanged: Boolean(dependencyContext.lockfileChanged),
    },
  });
  const hash = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 16);
  const label = `${errorType}-${affectedFile ? String(affectedFile).split('/').pop() : 'unknown'}`.replace(/[^A-Za-z0-9_.-]/g, '-');
  return { version: 1, signature: `${label}-${hash}`, hash, normalizedInput: seed };
}
