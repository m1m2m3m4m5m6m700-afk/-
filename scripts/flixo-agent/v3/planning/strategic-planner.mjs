const STAGES={
  jsqr:{title:'repair dependency',gate:'Node',risk:'medium',priority:1},
  'arabic-test-case':{title:'repair QR test contract',gate:'Node',risk:'low',priority:2},
  playwright:{title:'repair browser environment',gate:'Windows',risk:'low',priority:3},
  baseline:{title:'repair baseline contract',gate:'Fast',risk:'medium',priority:0},
};

const POLICY={autoApply:false,ciRequiredBetweenSteps:true,maxAttemptsPerRootCause:3};

export function buildStrategicPlan(diagnosis){
  const roots=Array.isArray(diagnosis)?diagnosis:(diagnosis?.roots??(diagnosis?.known?[diagnosis]:[]));
  const steps=roots.map((root,index)=>{
    const stage=STAGES[root.pattern];
    if(!stage) return null;
    return {id:`step-${index+1}-${root.pattern}`,rootCause:root.pattern,title:stage.title,gate:stage.gate,risk:stage.risk,priority:stage.priority,dependsOn:index===0?[]:[`step-${index}-${roots[index-1].pattern}`],autoApply:false};
  }).filter(Boolean).sort((a,b)=>a.priority-b.priority);
  const ordered=steps.map((s,index)=>({...s,dependsOn:index===0?[]:[steps[index-1].id]}));
  return {version:3,status:ordered.length?'planned':'manual-review',steps:ordered,policy:POLICY};
}

export function nextEligibleStep(plan,completed=[]){const done=new Set(completed);return (plan.steps||[]).find(s=>(s.dependsOn||[]).every(d=>done.has(d)) )??null;}
