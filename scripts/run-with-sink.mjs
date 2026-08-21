import { spawnSync } from "node:child_process";
const sink=new URL("./error-sink.mjs",import.meta.url).pathname;
const command=process.argv[2],args=process.argv.slice(3);
if(!command){console.error("Usage: node scripts/run-with-sink.mjs <command> [args...]"),process.exit(2)}
const result=spawnSync("bash",["-lc",[command,...args].map((x)=>JSON.stringify(x)).join(" ")],{encoding:"utf8"});
if(result.stdout) process.stdout.write(result.stdout);
if(result.stderr) process.stderr.write(result.stderr);
if(result.status!==0){spawnSync(process.execPath,[sink,"record","--scanner","run-with-sink","--severity","CRITICAL","--message",`Wrapped command failed with exit ${result.status}`,"--details",JSON.stringify({command,args,status:result.status,stdout:result.stdout?.slice(-4000),stderr:result.stderr?.slice(-4000)})],{stdio:"inherit"})}
process.exit(result.status??1);
