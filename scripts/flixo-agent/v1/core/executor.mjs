import fs from 'node:fs/promises';
import path from 'node:path';
export async function execute(plan,{rootDir=process.cwd(),dryRun=true}={}){
 const updates=[];
 for(const change of plan?.changes??[]){
  const file=path.join(rootDir,change.file); const before=await fs.readFile(file,'utf8'); let after=before;
  if(change.type==='replace' || change.type==='insert-after'){
   const anchor=change.find??change.anchor; if(!anchor || before.split(anchor).length-1!==1) throw new Error(`anchor mismatch: ${change.file}`);
   after=change.type==='replace'?before.replace(anchor,change.content??''):before.replace(anchor,`${anchor}\n${change.content??''}`);
  } else if(change.type==='dependency-sync') throw new Error('dependency-sync requires v1 dependency sandbox and is not executable here');
  updates.push({file:change.file,before,after});
 }
 if(!dryRun) for(const u of updates) await fs.writeFile(path.join(rootDir,u.file),u.after);
 return {dryRun,applied:!dryRun,updates};
}
