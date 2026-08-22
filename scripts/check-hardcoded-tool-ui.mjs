import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const ROOT = path.resolve('src/tools');
const TECHNICAL = new Set(['FLIXO', 'SVG', 'WebP', 'JPG', 'PNG', 'GIF', 'BMP', 'OCR', 'AI', 'ZIP', 'EXIF', 'Seed', 'Pix', 'X', 'Y']);
const offenders = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(tsx|jsx)$/.test(entry.name)) await inspect(full);
  }
}

function isVisibleText(text) {
  const value = text.replace(/\s+/g, ' ').trim();
  if (!value || value.startsWith('{') || value.startsWith('<!--')) return false;
  const words = value.split(' ').filter(Boolean);
  return words.length > 0 && words.some((word) => /[A-Za-z]{3,}/.test(word) && !TECHNICAL.has(word.replace(/[^A-Za-z]/g, '')));
}

async function inspect(file) {
  const source = await readFile(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isJsxText(node) && isVisibleText(node.getText(source))) {
      const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      offenders.push(`${path.relative(process.cwd(), file)}:${line + 1}: ${node.getText(source).trim()}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

await walk(ROOT);
if (offenders.length) {
  console.error('Hardcoded visible JSX strings detected in src/tools:');
  for (const offender of offenders) console.error(`- ${offender}`);
  process.exit(1);
}
console.log('Tool UI hardcoded-string check passed.');
