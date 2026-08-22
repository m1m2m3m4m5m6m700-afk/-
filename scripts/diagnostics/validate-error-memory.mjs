import { readFile } from 'node:fs/promises';

const memory = await readFile('docs/ERROR-MEMORY.md', 'utf8');
const requiredSignatures = [
  'INVALID_WORKFLOW_YAML_SOCKET_ECHO',
  'SITEMAP_XML_QUERY_FALSE_POSITIVE',
  'DUPLICATE_LOCALIZED_ROUTE',
  'UNAVAILABLE_TOOL_200',
  'INVALID_RADIX_RANGE',
  'HARD_CODED_TOOL_UI_TEXT',
  'VERCEL_BUILD_RATE_LIMIT',
  'INEFFECTIVE_LOCALE_DYNAMIC_IMPORT',
  'UNINTENDED_DEPENDENCY_EDIT',
  'CANONICAL_ORIGIN_UNAVAILABLE',
];

if (!memory.includes('| Signature | Root cause | Durable fix | Class | Evidence |')) {
  throw new Error('Error memory table header is missing or malformed.');
}

const tableRows = memory
  .split('\n')
  .filter((line) => line.startsWith('| `'));

const signatures = tableRows.map((line) => line.split('|')[1]?.trim().replaceAll('`', '')).filter(Boolean);
const duplicateSignatures = signatures.filter((signature, index) => signatures.indexOf(signature) !== index);
if (duplicateSignatures.length) {
  throw new Error(`Error memory contains duplicate signatures: ${[...new Set(duplicateSignatures)].join(', ')}`);
}

if (tableRows.some((line) => line.split('|').length !== 7)) {
  throw new Error('Every error-memory record must contain signature, root cause, durable fix, class, and evidence columns.');
}

for (const signature of requiredSignatures) {
  const row = tableRows.find((line) => line.includes(`\`${signature}\``));
  if (!row) throw new Error(`Error memory is incomplete: missing ${signature}`);
  const cells = row.split('|').map((cell) => cell.trim());
  const [rootCause, durableFix, classification, evidence] = [cells[2], cells[3], cells[4], cells[5]];
  if (!rootCause || !durableFix || !classification || !evidence) {
    throw new Error(`Error memory record is incomplete: ${signature}`);
  }
}

console.log(`Error memory validated: ${signatures.length} unique verified signatures.`);
