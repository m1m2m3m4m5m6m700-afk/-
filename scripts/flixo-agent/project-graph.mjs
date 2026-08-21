import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_STATE = 'state/cognitive/project-graph.json';
const WORKFLOW_ROOT = '.github/workflows';
const IMPORT_PATTERN = /(?:from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

function repoRoot() {
  return process.env.FLIXO_REPO_ROOT || process.cwd();
}

async function readJson(relativePath, fallback = null) {
  try { return JSON.parse(await fs.readFile(path.join(repoRoot(), relativePath), 'utf8')); }
  catch (error) { if (error?.code === 'ENOENT') return fallback; throw error; }
}

async function walkFiles(relativeDir, output = []) {
  const root = path.join(repoRoot(), relativeDir);
  let entries;
  try { entries = await fs.readdir(root, { withFileTypes: true }); }
  catch (error) { if (error?.code === 'ENOENT') return output; throw error; }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === '.output') continue;
    const relative = path.join(relativeDir, entry.name).replaceAll(path.sep, '/');
    if (entry.isDirectory()) await walkFiles(relative, output);
    else output.push(relative);
  }
  return output;
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier));
  return base.endsWith('.js') || base.endsWith('.mjs') ? base : `${base}.mjs`;
}

function addNode(nodes, id, type, metadata = {}) {
  if (!nodes.has(id)) nodes.set(id, { id, type, ...metadata });
}

function addEdge(edges, from, to, type, metadata = {}) {
  edges.push({ from, to, type, ...metadata });
}

export async function buildProjectGraph() {
  const root = repoRoot();
  const nodes = new Map();
  const edges = [];
  const files = await walkFiles('.');

  for (const file of files) {
    const ext = path.posix.extname(file);
    const type = file.startsWith('.github/workflows/') ? 'workflow'
      : file === 'package.json' ? 'manifest'
      : file === 'tool-dependencies.json' ? 'dependency-contract'
      : ['.mjs', '.js', '.ts', '.tsx'].includes(ext) ? 'source'
      : 'file';
    addNode(nodes, file, type);
  }

  const pkg = await readJson('package.json', {});
  addNode(nodes, 'project:package', 'project', { name: pkg.name ?? null });
  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    const id = `dependency:${name}`;
    addNode(nodes, id, 'dependency', { version, scope: 'runtime' });
    addEdge(edges, 'project:package', id, 'declares');
  }
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    const id = `dependency:${name}`;
    addNode(nodes, id, 'dependency', { version, scope: 'development' });
    addEdge(edges, 'project:package', id, 'declares');
  }

  const contract = await readJson('tool-dependencies.json', {});
  addNode(nodes, 'project:tool-dependencies', 'dependency-contract');
  for (const tool of Object.values(contract.tools ?? contract)) {
    if (!tool || typeof tool !== 'object') continue;
    const toolId = `tool:${tool.id ?? tool.slug ?? tool.name ?? 'unknown'}`;
    addNode(nodes, toolId, 'tool', { name: tool.name ?? null });
    addEdge(edges, 'project:tool-dependencies', toolId, 'describes');
    for (const dep of tool.dependencies ?? []) {
      const depName = typeof dep === 'string' ? dep : dep.name;
      if (!depName) continue;
      const depId = `dependency:${depName}`;
      addNode(nodes, depId, 'dependency');
      addEdge(edges, toolId, depId, 'requires');
    }
  }

  for (const file of files.filter((item) => /\.(mjs|js|ts|tsx)$/.test(item))) {
    const source = await fs.readFile(path.join(root, file), 'utf8');
    let match;
    while ((match = IMPORT_PATTERN.exec(source))) {
      const specifier = match[1] ?? match[2];
      const target = resolveImport(file, specifier);
      if (target && files.includes(target)) addEdge(edges, file, target, 'imports');
    }
  }

  for (const workflow of files.filter((item) => item.startsWith(`${WORKFLOW_ROOT}/`) && /\.ya?ml$/.test(item))) {
    const source = await fs.readFile(path.join(root, workflow), 'utf8');
    addNode(nodes, workflow, 'workflow');
    for (const command of source.matchAll(/npm\s+(?:run|exec|install)\s+([^\s&|]+)/g)) {
      addEdge(edges, workflow, `command:${command[1]}`, 'executes');
      addNode(nodes, `command:${command[1]}`, 'command');
    }
    if (/playwright/i.test(source)) addEdge(edges, workflow, 'dependency:playwright', 'uses');
    if (/jsqr/i.test(source)) addEdge(edges, workflow, 'dependency:jsqr', 'uses');
  }

  const graph = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    repositoryRoot: root,
    sha: process.env.GITHUB_SHA || null,
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges,
    stats: { nodes: nodes.size, edges: edges.length },
  };
  return graph;
}

export async function writeProjectGraph(graph, relativePath = DEFAULT_STATE) {
  const target = path.join(repoRoot(), relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(graph, null, 2) + '\n');
  return target;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const graph = await buildProjectGraph();
  if (process.argv.includes('--write')) await writeProjectGraph(graph);
  process.stdout.write(JSON.stringify(graph, null, 2) + '\n');
}
