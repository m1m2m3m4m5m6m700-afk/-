const ROOT_PRIORITY = [
  "check-secrets",
  "check-lockfile",
  "check-config-env",
  "check-typecheck",
  "check-git-integrity",
  "check-test-quality",
  "check-regression-guard",
  "check-ast-architecture",
];
const DOWNSTREAM = new Map([
  ["check-typecheck", new Set(["check-bundle", "check-test-quality", "check-regression-guard"])],
  ["check-lockfile", new Set(["check-bundle", "check-test-quality"])],
  ["check-config-env", new Set(["check-client-runtime"])],
]);

export function correlateEntries(entries) {
  const bySha = new Map();
  for (const entry of entries) {
    if (!bySha.has(entry.sha)) bySha.set(entry.sha, []);
    bySha.get(entry.sha).push(entry);
  }
  const output = [];
  for (const [sha, group] of bySha) {
    const critical = group.filter((entry) => entry.severity === "CRITICAL");
    if (!critical.length) {
      output.push(...group);
      continue;
    }
    const roots = ROOT_PRIORITY.filter((scanner) => critical.some((entry) => entry.scanner === scanner));
    const rootScanner = roots[0] ?? critical[0].scanner;
    const root = critical.find((entry) => entry.scanner === rootScanner) ?? critical[0];
    const symptoms = critical.filter((entry) => entry !== root && DOWNSTREAM.get(rootScanner)?.has(entry.scanner));
    const suppressed = new Set(symptoms);
    output.push({
      ...root,
      details: {
        ...(root.details ?? {}),
        correlation: {
          rootCause: root.scanner,
          groupedCount: 1 + symptoms.length,
          suppressedScanners: symptoms.map((entry) => entry.scanner),
        },
      },
    });
    for (const entry of group) if (!suppressed.has(entry) && entry !== root) output.push(entry);
  }
  return output;
}

export function correlationFor(entry, entries) {
  const correlated = correlateEntries([...entries, entry]);
  return correlated.find((candidate) => candidate.timestamp === entry.timestamp && candidate.scanner === entry.scanner) ?? entry;
}
