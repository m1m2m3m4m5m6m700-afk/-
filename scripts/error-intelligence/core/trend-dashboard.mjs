import { readErrorHistory } from './decision-log.mjs';

export function summarizeTrends(records = readErrorHistory()) {
  const byType = {};
  const byFile = {};
  let totalRepairMs = 0;
  let repairs = 0;
  for (const record of records) {
    const type = record.parsed?.errorType || record.errorType || 'UNKNOWN';
    byType[type] = (byType[type] || 0) + 1;
    for (const file of record.rootCause?.affectedFiles || record.affectedFiles || []) byFile[file] = (byFile[file] || 0) + 1;
    if (Number.isFinite(record.repairDurationMs)) { totalRepairMs += record.repairDurationMs; repairs += 1; }
  }
  return {
    version: 1,
    totalErrors: records.length,
    topErrorTypes: Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 10),
    topAffectedFiles: Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 10),
    meanRepairDurationMs: repairs ? Math.round(totalRepairMs / repairs) : null,
    generatedAt: new Date().toISOString(),
  };
}

export function renderDashboard(summary) {
  return [
    '# FLIXO Error Intelligence',
    '',
    `Total errors: ${summary.totalErrors}`,
    `Mean repair duration: ${summary.meanRepairDurationMs ?? 'n/a'} ms`,
    '',
    '## Top error types',
    ...summary.topErrorTypes.map(([type, count]) => `- ${type}: ${count}`),
    '',
    '## Top affected files',
    ...summary.topAffectedFiles.map(([file, count]) => `- ${file}: ${count}`),
  ].join('\n');
}
