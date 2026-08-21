export async function execute(plan,{dryRun=true}={}){if(!dryRun)throw new Error('v3 executor requires human-approved outer execution layer');return {version:'3.0.0',dryRun,applied:false,plan};}
