import fs from 'node:fs/promises';
import path from 'node:path';
const root=()=>process.env.FLIXO_REPO_ROOT||process.cwd();
export async function buildProjectGraph(){const r=root();let pkg={};try{pkg=JSON.parse(await fs.readFile(path.join(r,'package.json'),'utf8'));}catch{}const nodes=[{id:'project:package',type:'manifest'}];const edges=[];for(const [name,version] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){nodes.push({id:`dependency:${name}`,type:'dependency',version});edges.push({from:'project:package',to:`dependency:${name}`,type:'declares'});}return {schemaVersion:2,independent:true,version:'2.0.0',nodes,edges};}
