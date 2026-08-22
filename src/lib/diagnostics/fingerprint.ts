export type DiagnosticStage = 'ui' | 'router' | 'api' | 'workflow' | 'ci';

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/\b[0-9a-f]{8,}\b/gi, '<id>')
    .replace(/\d+/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

export function createDiagnosticFingerprint(input: {
  kind: string;
  stage: DiagnosticStage;
  message: string;
  route?: string;
}): string {
  const value = `${input.stage}|${input.kind}|${input.route ?? '<none>'}|${normalizeMessage(input.message)}`;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `flx-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
