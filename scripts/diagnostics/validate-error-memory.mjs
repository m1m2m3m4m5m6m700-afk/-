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
  'UNINTENDED_DEPENDENCY_EDIT',
];
const allowedClasses = new Set(['CI/code', 'SEO/test', 'architecture', 'SEO/runtime', 'dependency', 'i18n', 'external', 'process/dependency']);
const incidentEvidencePattern = /(?:CI|PR)\s*:\s*#?[0-9]+|(?:CI|PR)\s+#[0-9]+|commit:\s*`[0-9a-f]{8,40}`|correction commit:\s*`[0-9a-f]{8,40}`|provider:\s*Vercel[;,.]?\s+(?:failure|failures|state)|failure:\s*[^|]+/i;
const referencePattern = /(?:PR\s*:\s*`?#[0-9]+`?|CI\s*:\s*`?#[0-9]+`?|commit:\s*`[0-9a-f]{8,40}`|correction commit:\s*`[0-9a-f]{8,40}`|provider:\s*Vercel)/i;

if (!memory.includes('| Signature | Root cause | Durable fix | Class | Evidence |')) {
  throw new Error('Error memory verified-incident table header is missing or malformed.');
}

const incidentSection = memory.split('## Verified external constraints')[0];
const tableRows = incidentSection
  .split('\n')
  .filter((line) => /^\| `[^`]+` \|/.test(line));

const signatures = tableRows
  .map((line) => line.split('|')[1]?.trim().replaceAll('`', ''))
  .filter(Boolean);

const duplicateSignatures = signatures.filter((signature, index) => signatures.indexOf(signature) !== index);
if (duplicateSignatures.length) {
  throw new Error(`Error memory contains duplicate incident signatures: ${[...new Set(duplicateSignatures)].join(', ')}`);
}

const signaturePattern = /^[A-Z][A-Z0-9_]+$/;
for (const [index, line] of tableRows.entries()) {
  const cells = line.split('|').map((cell) => cell.trim());
  if (cells.length !== 7) {
    throw new Error(`Error memory incident row ${index + 1} must contain exactly 5 data columns.`);
  }
  const [, signature, rootCause, durableFix, classification, evidence] = cells;
  if (!signature || !rootCause || !durableFix || !classification || !evidence) {
    throw new Error(`Error memory incident row ${index + 1} is incomplete.`);
  }
  const normalizedSignature = signature.replaceAll('`', '');
  const normalizedClass = classification.replaceAll('`', '');
  if (!signaturePattern.test(normalizedSignature)) {
    throw new Error(`Error memory incident row ${index + 1} has an invalid signature: ${normalizedSignature}`);
  }
  if (!allowedClasses.has(normalizedClass)) {
    throw new Error(`Error memory incident row ${index + 1} has an invalid class: ${normalizedClass}`);
  }
  if (rootCause.length < 20 || durableFix.length < 20) {
    throw new Error(`Error memory incident row ${index + 1} has insufficient root-cause or durable-fix detail.`);
  }
  if (!incidentEvidencePattern.test(evidence) || !referencePattern.test(evidence)) {
    throw new Error(`Error memory incident row ${index + 1} has untraceable evidence: ${evidence}`);
  }
}

for (const signature of requiredSignatures) {
  const row = tableRows.find((line) => line.includes(`\`${signature}\``));
  if (!row) throw new Error(`Error memory is incomplete: missing ${signature}`);
}

const constraintSection = memory.split('## Verified external constraints')[1]?.split('## Architectural review findings')[0] ?? '';
if (!constraintSection.includes('`CANONICAL_ORIGIN_UNAVAILABLE`')) {
  throw new Error('Verified external constraint CANONICAL_ORIGIN_UNAVAILABLE is missing.');
}
if (!/^\| Constraint \| Impact \| Required handling \| Evidence \|/m.test(constraintSection)) {
  throw new Error('External constraint table header is missing or malformed.');
}
const constraintRows = constraintSection.split('\n').filter((line) => /^\| `[^`]+` \|/.test(line));
if (!constraintRows.every((line) => referencePattern.test(line))) {
  throw new Error('Every external constraint must include traceable evidence.');
}

const reviewSection = memory.split('## Architectural review findings')[1]?.split('## Error-memory contract')[0] ?? '';
if (!reviewSection.includes('`INEFFECTIVE_LOCALE_DYNAMIC_IMPORT`')) {
  throw new Error('Architectural review finding INEFFECTIVE_LOCALE_DYNAMIC_IMPORT is missing.');
}
if (!/^\| Finding \| Prevention \| Evidence class \|/m.test(reviewSection)) {
  throw new Error('Architectural review table header is missing or malformed.');
}
const reviewRows = reviewSection.split('\n').filter((line) => /^\| `[^`]+` \|/.test(line));
if (!reviewRows.every((line) => referencePattern.test(line))) {
  throw new Error('Every architectural review finding must include traceable evidence.');
}

console.log(`Error memory validated: ${signatures.length} verified incidents; constraints and review findings classified separately.`);
