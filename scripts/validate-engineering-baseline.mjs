/* global process, console */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const failures = [];
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const readText = async (path) => readFile(resolve(root, path), 'utf8');
const manifest = await readJson('config/engineering-baseline.json');
const pkg = await readJson('package.json');
const ci = await readText('.github/workflows/ci.yml');

if (manifest.productionBranch !== 'main') failures.push('productionBranch must be main');
if (manifest.integrationBranch !== 'develop') failures.push('integrationBranch must be develop');
if (manifest.experimentalBranch !== 'experimental') failures.push('experimentalBranch must be experimental');
if (manifest.rules.noExperimentalToMain !== true) failures.push('experimental-to-main protection must remain enabled');
if (manifest.rules.noDestructiveCleanup !== true) failures.push('destructive cleanup prohibition must remain enabled');
if (manifest.canonicalVerification !== 'npm run verify') failures.push('canonical verification command must remain npm run verify');
if (typeof pkg.scripts?.verify !== 'string') failures.push('package.json must define the canonical verify script');
if (!ci.includes('npm run verify')) failures.push('CI must execute the canonical verify command');

if (failures.length) {
  console.error('FLIXO engineering baseline: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('FLIXO engineering baseline: PASS');
console.log(`production=${manifest.productionBranch}`);
console.log(`integration=${manifest.integrationBranch}`);
console.log(`experimental=${manifest.experimentalBranch}`);
console.log(`canonical=${manifest.canonicalVerification}`);
