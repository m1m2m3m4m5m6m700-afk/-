export async function execute(plan,{dryRun=true}={}){if(!plan?.approved&&!dryRun)throw new Error('v2 apply requires verified approval');return {version:'2.0.0',dryRun,applied:false,plan};}
