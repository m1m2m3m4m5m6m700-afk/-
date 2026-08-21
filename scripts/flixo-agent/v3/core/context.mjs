import { buildProjectGraph } from '../cognitive/project-graph.mjs'; import { getDecisions } from '../cognitive/decision-log.mjs';
export async function collectContext(){return {version:'3.0.0',projectGraph:await buildProjectGraph(),decisions:await getDecisions(),sha:process.env.GITHUB_SHA||null};}
