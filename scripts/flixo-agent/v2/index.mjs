import { diagnose } from './core/diagnose.mjs'; import { plan } from './core/planner.mjs'; import { verify } from './core/verifier.mjs'; import { collectContext } from './core/context.mjs';
export async function runV2(log,options={}){const context=await collectContext();const diagnosis=diagnose(log);const repairPlan=plan(diagnosis);const verification=verify(repairPlan,options);return {version:'2.0.0',context,diagnosis,plan:repairPlan,verification};}
if(import.meta.url===`file://${process.argv[1]}`){console.log(JSON.stringify(await runV2(process.argv.slice(2).join(' ')),null,2));}
