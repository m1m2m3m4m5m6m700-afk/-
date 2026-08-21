import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const sink=new URL("./error-sink.mjs",import.meta.url).pathname;
const scanners=["check-typecheck","check-lockfile","check-secrets","check-config-env","check-antipatterns","check-deadcode","check-test-quality","check-bundle","check-i18n","check-git-integrity","check-client-runtime","check-ast-architecture","check-regression-guard"];
const session=spawnSync(process.execPath,[sink,"begin"],{encoding:"utf8"}); if(session.status!==0) process.exit(session.status||1);
for(const name of scanners){const file=new URL(`./diagnostics/${name}.mjs`,import.meta.url).pathname;const r=spawnSync(process.execPath,[file],{encoding:"utf8"});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);}
const summary=spawnSync(process.execPath,[sink,"summary"],{encoding:"utf8"});if(summary.stdout)process.stdout.write(summary.stdout);if(summary.stderr)process.stderr.write(summary.stderr);process.exit(summary.status||0);
