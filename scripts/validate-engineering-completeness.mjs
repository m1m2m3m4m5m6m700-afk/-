import fs from 'node:fs/promises';

const required = [
  'docs/engineering/completeness.md',
  'docs/engineering/early-detection-suite.md',
  'docs/engineering/final-promotion.md',
  'docs/engineering/governance.md',
];
const missing = [];
for (const file of required) {
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size === 0) missing.push(file);
  } catch {
    missing.push(file);
  }
}

if (missing.length) {
  console.error(`ENGINEERING COMPLETENESS: FAIL (${missing.length} missing/empty contract file(s))`);
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log('ENGINEERING COMPLETENESS: PASS (documentation/control-plane contract present)');
console.log(`Validated: ${required.join(', ')}`);
