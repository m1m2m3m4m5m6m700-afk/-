import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve('scripts/flixo-agent');
const versions = ['v1','v2','v3'];

test('v1/v2/v3 have independent entrypoints and version manifests', async () => {
  for (const version of versions) {
    const manifest = JSON.parse(await fs.readFile(path.join(root, version, 'VERSION.json'), 'utf8'));
    assert.equal(manifest.independent, true);
    assert.equal(manifest.importsOtherVersions, false);
    await fs.access(path.join(root, version, 'index.mjs'));
  }
});

test('version directories do not import sibling versions', async () => {
  async function walk(dir) {
    const out=[];
    for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
      const full=path.join(dir,entry.name);
      if(entry.isDirectory()) out.push(...await walk(full));
      else if(full.endsWith('.mjs')) out.push(full);
    }
    return out;
  }
  for (const version of versions) {
    const files=await walk(path.join(root,version));
    for(const file of files){
      const text=await fs.readFile(file,'utf8');
      assert.doesNotMatch(text,/flixo-agent\/v[123]/,`${file} imports another version`);
      assert.doesNotMatch(text,/\.\.\/v[123]\//,`${file} imports another version`);
    }
  }
});
