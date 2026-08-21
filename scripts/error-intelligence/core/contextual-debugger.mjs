export function buildDebugReport({ signature, parsed, rootCause, baseline = null, commit = null } = {}) {
  const proposedFix = (() => {
    switch (parsed?.errorType) {
      case 'TYPECHECK': return 'Apply the smallest source-level type correction at the affected file, then rerun typecheck and affected-tool tests.';
      case 'DEPENDENCY': return 'Reconcile package.json/package-lock.json using the guarded dependency contract; do not edit package.json automatically.';
      case 'PLAYWRIGHT': return 'Reproduce the browser interaction with the same fixture and verify the gate before changing application code.';
      case 'BUILD': return 'Reproduce the bundler failure locally, inspect the first deterministic module error, then rerun build.';
      case 'SECURITY': return 'Review the security finding, patch only the affected dependency/code path, and rerun the security gate.';
      case 'LOCALIZATION': return 'Add or correct the missing translation/resource key and rerun the localization gate.';
      case 'WORKFLOW': return 'Inspect the workflow contract and runner environment; do not auto-edit workflow semantics.';
      default: return 'Escalate for human review; no safe deterministic fix is available.';
    }
  })();

  return {
    version: 1,
    signature: signature?.signature ?? null,
    summary: `${parsed?.errorType ?? 'UNKNOWN'}: ${parsed?.errorMessage ?? 'No error message extracted.'}`,
    reproduction: {
      sourceGate: baseline?.gate ?? null,
      steps: [
        'Run the same CI gate on the same commit SHA.',
        parsed?.affectedFile ? `Inspect ${parsed.affectedFile}${parsed.line ? `:${parsed.line}` : ''}.` : 'Inspect the first deterministic error location.',
        'Compare the resulting log against the stored error signature.',
      ],
    },
    proposedFix,
    confidence: Math.round((rootCause?.confidence ?? 0.45) * 100),
    rootCause,
    commit: commit ? { sha: commit.sha ?? null, changedFiles: commit.changedFiles ?? [] } : null,
    baseline,
    policy: {
      readOnly: true,
      autoApplyAllowed: false,
      selfHealAuthority: 'existing-policy-only',
    },
  };
}
