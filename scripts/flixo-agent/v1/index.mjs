import { diagnose } from './core/diagnose.mjs';
import { plan } from './core/planner.mjs';
import { verify } from './core/verifier.mjs';
export function runV1(log, options={}){ const diagnosis=diagnose(log); const repairPlan=plan(diagnosis); const verification=verify(repairPlan,options); return {version:'1.0.0',diagnosis,plan:repairPlan,verification}; }
if(import.meta.url===`file://${process.argv[1]}`){ const result=runV1(process.argv.slice(2).join(' ')); console.log(JSON.stringify(result,null,2)); process.exit(result.verification.valid?0:2); }
