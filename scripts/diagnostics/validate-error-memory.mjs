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
];

const missing = requiredSignatures.filter((signature) => !memory.includes(signature));
if (missing.length) {
  throw new Error(`Error memory is incomplete: ${missing.join(', ')}`);
}

if (!memory.includes('Durable fix') || !memory.includes('Class')) {
  throw new Error('Error memory must contain root-cause, durable-fix, and classification columns.');
}

console.log(`Error memory validated: ${requiredSignatures.length} verified signatures.`);
