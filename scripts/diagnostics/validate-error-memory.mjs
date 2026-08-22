import { readFile } from 'node:fs/promises';

const memory = await readFile('docs/ERROR-MEMORY.md', 'utf8');
const requiredIncidents = [
  'INVALID_WORKFLOW_YAML_SOCKET_ECHO',
  'SITEMAP_XML_QUERY_FALSE_POSITIVE',
  'DUPLICATE_LOCALIZED_ROUTE',
  'UNAVAILABLE_TOOL_200',
  'INVALID_RADIX_RANGE',
  'HARD_CODED_TOOL_UI_TEXT',
  'UNINTENDED_DEPENDENCY_EDIT',
  'MANIFEST_LOCKFILE_RANGE_DRIFT',
  'STALE_DIAGNOSTIC_ROUTE_PATH',
];
const requiredConstraints = ['VERCEL_BUILD_RATE_LIMIT', 'CANONICAL_ORIGIN_UNAVAILABLE'];
const requiredFindings = ['INEFFECTIVE_LOCALE_DYNAMIC_IMPORT'];
const allowedClasses = new Set(['CI/code', 'SEO/test', 'architecture', 'SEO/runtime', 'dependency', 'i18n', 'process/dependency', 'diagnostics/tooling']);
const incidentEvidencePattern = /(?:CI|PR)\s*:\s*#?[0-9]+|commit:\s*`[0-9a-f]{8,40}`|correction commit:\s*`[0-9a-f]{8,40}`|failure:\s*[^|]+/i;
const referencePattern = /(?:PR|CI)\s*:\s*`?#[0-9]+`?|commit:\s*`[0-9a-f]{8,40}`|correction commit:\s*`[0-9a-f]{8,40}`|provider:\s*Vercel/i;

if (!memory.includes('| Signature | Root cause | Durable fix | Class | Evidence |')) {
  throw new Error('Error memory verified-incident table header is missing or malformed.');
}

const incidentSection = memory.split('## Verified external constraints')[0];
const incidentRows = incidentSection.split('\n').filter((line) => /^\| `[^`]+` \|/.test(line));
const signatures = incidentRows.map((line) => line.split('|')[1]?.trim().replaceAll('`', '')).filter(Boolean);

if (incidentRows.length !== requiredIncidents.length) {
  throw new Error(`Verified incident count mismatch: expected=${requiredIncidents.length} actual=${incidentRows.length}. Move constraints/findings out of the incident table.`);
}

const duplicateSignatures = signatures.filter((signature, index) => signatures.indexOf(signature) !== index);
if (duplicateSignatures.length) {
  throw new Error(`Error memory contains duplicate incident signatures: ${[...new Set(duplicateSignatures)].join(', ')}`);
}

const unexpectedIncidents = signatures.filter((signature) => !requiredIncidents.includes(signature));
if (unexpectedIncidents.length) {
  throw new Error(`Unexpected incident signatures: ${unexpectedIncidents.join(', ')}. Add evidence and classification first, or move them to the correct section.`);
}

const signaturePattern = /^[A-Z][A-Z0-9_]+$/;
for (const [index, line] of incidentRows.entries()) {
  const cells = line.split('|').map((cell) => cell.trim());
  if (cells.length !== 7) throw new Error(`Incident row ${index + 1} must contain exactly 5 data columns.`);
  const [, signature, rootCause, durableFix, classification, evidence] = cells;
  const normalizedSignature = signature.replaceAll('`', '');
  const normalizedClass = classification.replaceAll('`', '');
  if (!signaturePattern.test(normalizedSignature)) throw new Error(`Invalid incident signature: ${normalizedSignature}`);
  if (!allowedClasses.has(normalizedClass)) throw new Error(`Invalid incident class for ${normalizedSignature}: ${normalizedClass}`);
  if (rootCause.length < 20 || durableFix.length < 20) throw new Error(`Incident ${normalizedSignature} lacks sufficient root-cause or durable-fix detail.`);
  if (!incidentEvidencePattern.test(evidence) || !referencePattern.test(evidence)) throw new Error(`Incident ${normalizedSignature} has untraceable evidence: ${evidence}`);
}

for (const signature of requiredIncidents) {
  if (!incidentRows.some((line) => line.includes(`\`${signature}\``))) throw new Error(`Missing verified incident: ${signature}`);
}

const constraintSection = memory.split('## Verified external constraints')[1]?.split('## Architectural review findings')[0] ?? '';
if (!/^\| Constraint \| Impact \| Required handling \| Evidence \|/m.test(constraintSection)) throw new Error('External constraint table header is missing or malformed.');
const constraintRows = constraintSection.split('\n').filter((line) => /^\| `[^`]+` \|/.test(line));
for (const signature of requiredConstraints) {
  if (!constraintRows.some((line) => line.includes(`\`${signature}\``))) throw new Error(`Missing external constraint: ${signature}`);
}
if (constraintRows.length !== requiredConstraints.length) throw new Error(`External constraint count mismatch: expected=${requiredConstraints.length} actual=${constraintRows.length}.`);
if (!constraintRows.every((line) => referencePattern.test(line))) throw new Error('Every external constraint must include traceable evidence.');

const reviewSection = memory.split('## Architectural review findings')[1]?.split('## Error-memory contract')[0] ?? '';
if (!/^\| Finding \| Prevention \| Evidence class \|/m.test(reviewSection)) throw new Error('Architectural review table header is missing or malformed.');
const reviewRows = reviewSection.split('\n').filter((line) => /^\| `[^`]+` \|/.test(line));
for (const finding of requiredFindings) {
  if (!reviewRows.some((line) => line.includes(`\`${finding}\``))) throw new Error(`Missing architectural finding: ${finding}`);
}
if (reviewRows.length !== requiredFindings.length) throw new Error(`Architectural review finding count mismatch: expected=${requiredFindings.length} actual=${reviewRows.length}.`);
if (!reviewRows.every((line) => referencePattern.test(line))) throw new Error('Every architectural review finding must include traceable evidence.');

console.log(`Error memory validated: ${incidentRows.length} verified incidents; ${constraintRows.length} external constraints; ${reviewRows.length} architectural findings.`);
