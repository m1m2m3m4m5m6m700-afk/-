import { diagnose, diagnoseAll } from './core/diagnose.mjs';
import { collectContext } from './core/context.mjs';
import { buildStrategicPlan } from './planning/strategic-planner.mjs';
import { verify } from './core/verifier.mjs';

export async function runV3(log){
  const context=await collectContext();
  const roots=diagnoseAll(log);
  const primary=roots[0] ?? diagnose(log);
  const plan=buildStrategicPlan(roots);
  const verification=verify(plan);
  return {version:'3.0.0',context,diagnosis:primary,roots,plan,verification};
}

if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify(await runV3(process.argv.slice(2).join(' ')),null,2));
