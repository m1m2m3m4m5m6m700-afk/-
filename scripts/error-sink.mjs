import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
const ROOT=process.cwd(), LOG=join(ROOT,"errors.log.json"), DEC=join(ROOT,"DECISION_LOG.md"), EVIDENCE=join(ROOT,"diagnostics"), ELOG=join(EVIDENCE,"errors.log.json"), EDEC=join(EVIDENCE,"DECISION_LOG.md");
const SECRET=/((?:sk|xox|ghp|github_pat|AIza)[-_A-Za-z0-9]{12,}|-----BEGIN [^-]+ PRIVATE KEY-----|(?:password|secret|token|api[_-]?key)\s*[:=]\s*["'][^"']+["'])/gi;
function sha(){const v=execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim();if(!/^[0-9a-f]{40}$/i.test(v))throw new Error("Missing exact SHA");return v}
function scrub(v){if(typeof v!=="string")return v;return v.replace(SECRET,"[REDACTED]")}
function load(){if(!existsSync(LOG))return[];try{return JSON.parse(readFileSync(LOG,"utf8"))}catch{return[]}}
function save(entries){writeFileSync(LOG,JSON.stringify(entries,null,2)+"\n");writeFileSync(join(EVIDENCE,"errors.log.json"),JSON.stringify(entries,null,2)+"\n")}
function appendDecision(line){appendFileSync(DEC,line);appendFileSync(EDEC,line)}
function parseArgs(argv){const a={};for(let i=2;i<argv.length;i+=1){const k=argv[i],v=argv[i+1];if(k?.startsWith("--")){a[k.slice(2)]=v?.startsWith("--")?true:v;i+=v?.startsWith("--")?0:1}}return a}
const args=parseArgs(process.argv), command=process.argv[2];
writeFileSync(EVIDENCE,"errors.log.json",existsSync(ELOG)?readFileSync(ELOG):Buffer.from("[]\n"),{flag:"w"});
if(command==="record"){
  const entry={timestamp:new Date().toISOString(),sha:sha(),scanner:args.scanner||"unknown",severity:args.severity||"INFO",message:scrub(args.message||""),details:JSON.parse(scrub(args.details||"{}"))};
  const entries=load();entries.push(entry);save(entries);appendDecision(`\n- ${entry.timestamp} | ${entry.sha} | ${entry.scanner} | ${entry.severity} | ${entry.message}`);process.stdout.write(JSON.stringify({ok:true,scanner:entry.scanner,severity:entry.severity,sha:entry.sha})+"\n");
}else if(command==="begin"){
  const session={timestamp:new Date().toISOString(),sha:sha(),scanner:"session",severity:"INFO",message:"diagnostic session started",details:{sessionId:`diag-${Date.now()}`}};const entries=load();entries.push(session);save(entries);appendDecision(`\n\n## Diagnostic session ${session.details.sessionId}\n- SHA: ${session.sha}\n- Started: ${session.timestamp}\n`);process.stdout.write(session.details.sessionId+"\n");
}else if(command==="summary"){
  const entries=load(), latestSha=sha(), current=entries.filter(e=>e.sha===latestSha);const critical=current.filter(e=>e.severity==="CRITICAL").length;const failed=current.filter(e=>e.severity==="CRITICAL").map(e=>e.scanner);process.stdout.write(JSON.stringify({sha:latestSha,entries:current.length,critical,failed},null,2)+"\n");process.exitCode=critical?1:0;
}else{process.stderr.write("error-sink usage: record|begin|summary\n");process.exitCode=2}
