import fs from 'node:fs/promises'; import path from 'node:path';
const file=()=>path.join(process.env.FLIXO_REPO_ROOT||process.cwd(),'state/cognitive/v3-decision-log.json');
export async function appendDecision(value){const target=file();let rows=[];try{rows=JSON.parse(await fs.readFile(target,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}rows.push({...value,version:'3.0.0',timestamp:value.timestamp??new Date().toISOString()});await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(rows,null,2)+'\n');return rows.at(-1);}
export async function getDecisions(){try{return JSON.parse(await fs.readFile(file(),'utf8'));}catch(e){if(e.code==='ENOENT')return [];throw e;}}
