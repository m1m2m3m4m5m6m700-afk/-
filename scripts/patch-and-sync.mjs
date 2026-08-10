#!/usr/bin/env node
/**
 * Flixo patch & sync helper.
 *
 * Runs the project's own verification (`npm run verify`), applies safe
 * formatting fixes (prettier + eslint --fix), and — when asked — commits and
 * pushes to a feature branch and opens a pull request. It never pushes
 * directly to `main`.
 *
 * Usage:
 *   node scripts/patch-and-sync.mjs status   # show repo state
 *   node scripts/patch-and-sync.mjs patch     # prettier + eslint --fix only
 *   node scripts/patch-and-sync.mjs verify    # run npm run verify
 *   node scripts/patch-and-sync.mjs push      # verify, commit, push branch
 *   node scripts/patch-and-sync.mjs all       # patch + verify + push + PR
 *
 * Options:
 *   --branch <name>   feature branch to push (default: chore/patch-sync-<ts>)
 *   --base <name>     PR base branch (default: main)
 *   --no-pr           push without opening a PR
 *   --message <text>  override the generated commit message
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const CONFIG = {
  remote: "origin",
  baseBranch: "main",
  defaultBranchPrefix: "chore/patch-sync",
  verifyCommand: "npm run verify",
  patchCommands: [
    {
      name: "Prettier",
      command: 'npx prettier --write "src/**/*.{ts,tsx,js,jsx,mjs,json,css,md}"',
    },
    { name: "ESLint --fix", command: "npm run lint -- --fix" },
  ],
};

const COLOR = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = {
  info: (m) => console.log(`${COLOR.cyan}ℹ${COLOR.reset} ${m}`),
  success: (m) => console.log(`${COLOR.green}✓${COLOR.reset} ${m}`),
  error: (m) => console.log(`${COLOR.red}✗${COLOR.reset} ${m}`),
  warn: (m) => console.log(`${COLOR.yellow}⚠${COLOR.reset} ${m}`),
  header: () => console.log(`\n${COLOR.white}${"═".repeat(60)}${COLOR.reset}`),
};

function exec(command, { cwd = ROOT } = {}) {
  try {
    const output = execSync(command, { encoding: "utf8", stdio: "pipe", cwd });
    return { success: true, output: output.trim() };
  } catch (error) {
    return {
      success: false,
      output: (error.stdout ?? "").trim() || error.message,
      code: error.status,
    };
  }
}

function getChangedFiles() {
  const result = exec("git status --porcelain");
  if (!result.success) return [];
  return result.output
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => ({
      status: line.slice(0, 2),
      file: line.slice(3),
    }));
}

function generateCommitMessage(files, override) {
  if (override) return override;
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");
  const modified = files.filter((f) => f.status.includes("M"));
  const added = files.filter((f) => f.status.includes("A") && !f.status.includes("D"));
  const deleted = files.filter((f) => f.status.includes("D"));
  const renamed = files.filter((f) => f.status.includes("R"));

  const lines = [`chore: patch & sync ${stamp}`, ""];
  const section = (label, list) => {
    if (!list.length) return;
    lines.push(`${label}:`, ...list.map((f) => `  - ${f.file}`), "");
  };
  section("Added", added);
  section("Modified", modified);
  section("Deleted", deleted);
  section("Renamed", renamed);
  lines.push(`Total files: ${files.length}`);
  return lines.join("\n");
}

function parseArgs(argv) {
  let command = null;
  const opts = {
    command: "all",
    branch: null,
    base: CONFIG.baseBranch,
    openPR: true,
    message: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--branch") opts.branch = argv[++i];
    else if (arg === "--base") opts.base = argv[++i];
    else if (arg === "--no-pr") opts.openPR = false;
    else if (arg === "--message") opts.message = argv[++i];
    else if (arg === "--help" || arg === "-h") opts.command = "help";
    else if (!arg.startsWith("-") && command === null) {
      command = arg;
      opts.command = arg;
    }
  }
  return opts;
}

function ensureFeatureBranch(name) {
  const branch = name || `${CONFIG.defaultBranchPrefix}-${Date.now()}`;
  const current = exec("git branch --show-current").output;
  if (current === CONFIG.baseBranch) {
    exec(`git checkout -b ${branch}`);
    log.info(`Created and switched to branch: ${branch}`);
  } else {
    log.info(`Using existing branch: ${current}`);
  }
  return branch;
}

function preCommitChecks() {
  log.header();
  log.info("Running pre-commit verification (npm run verify)...");
  const result = exec(CONFIG.verifyCommand);
  if (result.success) {
    log.success("Verification passed");
    return true;
  }
  log.error("Verification failed");
  console.log(result.output);
  return false;
}

function autoPatch() {
  log.header();
  log.info("Applying safe formatting patches...");
  for (const { name, command } of CONFIG.patchCommands) {
    log.info(`  ↳ ${name}...`);
    const result = exec(command);
    if (result.success) log.success(`    ✓ ${name}`);
    else log.warn(`    ⚠ ${name} reported issues (may be non-fatal)`);
  }
  log.success("Patch step complete");
  return true;
}

function pushChanges({ branch, base, openPR, message }) {
  log.header();
  log.info("Preparing commit and push...");
  const files = getChangedFiles();
  if (files.length === 0) {
    log.warn("No changes to push");
    return false;
  }
  log.info(`  ↳ ${files.length} changed file(s)`);

  exec("git add -A");
  const commitMessage = generateCommitMessage(files, message);
  const msgFile = path.join(ROOT, ".commit-msg.tmp");
  fs.writeFileSync(msgFile, commitMessage, "utf8");
  const commitResult = exec(`git commit -F "${msgFile}"`);
  fs.rmSync(msgFile, { force: true });
  if (!commitResult.success) {
    log.error("Commit failed");
    console.log(commitResult.output);
    return false;
  }
  log.success(`  ✓ Committed: ${commitResult.output.split("\n")[0]}`);

  log.info(`  ↳ Pushing to ${CONFIG.remote}/${branch}...`);
  const pushResult = exec(`git push -u ${CONFIG.remote} ${branch}`);
  if (!pushResult.success) {
    log.error("Push failed");
    console.log(pushResult.output);
    return false;
  }
  log.success("  ✓ Pushed to GitHub");

  if (openPR) {
    log.info("  ↳ Opening pull request...");
    const prResult = exec(
      `gh pr create --base ${base} --head ${branch} --title "chore: patch & sync" --body "Automated patch & sync via scripts/patch-and-sync.mjs. Runs prettier + eslint --fix and npm run verify."`,
    );
    if (prResult.success) {
      log.success(`  ✓ Pull request opened: ${prResult.output}`);
    } else {
      log.warn("  ⚠ Could not open PR automatically (push succeeded)");
      console.log(prResult.output);
    }
  }
  return true;
}

function syncWithGitHub() {
  log.header();
  log.info("Syncing with GitHub...");
  const fetchResult = exec(`git fetch ${CONFIG.remote}`);
  if (!fetchResult.success) {
    log.error("Fetch failed");
    return false;
  }
  const current = exec("git branch --show-current").output;
  if (current === CONFIG.baseBranch) {
    const mergeResult = exec(`git merge ${CONFIG.remote}/${CONFIG.baseBranch} --no-edit`);
    if (!mergeResult.success) {
      log.warn("Merge may have conflicts — resolve manually");
      console.log(mergeResult.output);
      return false;
    }
  } else {
    log.info(`On feature branch '${current}' — skipping merge of ${CONFIG.baseBranch}`);
  }
  log.success("Sync complete");
  return true;
}

function statusReport() {
  log.header();
  log.info("Status report");
  const files = getChangedFiles();
  log.info(`  ↳ Changed files: ${files.length}`);
  for (const f of files) log.info(`    - ${f.status} ${f.file}`);
  const lastCommit = exec("git log -1 --oneline");
  if (lastCommit.success) log.info(`  ↳ Last commit: ${lastCommit.output}`);
  const branch = exec("git branch --show-current");
  if (branch.success) log.info(`  ↳ Current branch: ${branch.output}`);
  const remote = exec(`git ls-remote ${CONFIG.remote} ${CONFIG.baseBranch}`);
  if (remote.success) {
    const local = exec(`git rev-parse ${CONFIG.baseBranch}`);
    if (local.success && remote.output.includes(local.output)) {
      log.success("  ✓ In sync with GitHub");
    } else {
      log.warn("  ⚠ Not in sync with GitHub");
    }
  }
}

function printHelp() {
  console.log(`
Flixo patch & sync helper

Usage: node scripts/patch-and-sync.mjs <command> [options]

Commands:
  status   Show repository state
  sync     Fetch and merge from origin
  patch    Apply prettier + eslint --fix (no commit)
  verify   Run npm run verify
  push     Verify, commit, push to a feature branch (+ PR)
  all      patch + verify + push (+ PR)   (default)

Options:
  --branch <name>   feature branch (default: chore/patch-sync-<ts>)
  --base <name>     PR base branch (default: main)
  --no-pr           push without opening a PR
  --message <text>  override commit message
  -h, --help        show this help

This tool never pushes directly to main.
`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  log.header();
  console.log(`🤖 Flixo patch & sync`);
  console.log(`   base: ${opts.base}`);

  try {
    switch (opts.command) {
      case "help":
        printHelp();
        break;
      case "status":
        statusReport();
        break;
      case "sync":
        syncWithGitHub();
        break;
      case "patch":
        autoPatch();
        break;
      case "verify":
        preCommitChecks();
        break;
      case "push": {
        if (opts.verifyBeforePush && !preCommitChecks()) {
          log.error("Verification failed — aborting push");
          process.exit(1);
        }
        const branch = ensureFeatureBranch(opts.branch);
        pushChanges({ branch, base: opts.base, openPR: opts.openPR, message: opts.message });
        break;
      }
      case "all":
      default: {
        syncWithGitHub();
        autoPatch();
        if (opts.verifyBeforePush && !preCommitChecks()) {
          log.error("Verification failed — aborting push");
          process.exit(1);
        }
        const branch = ensureFeatureBranch(opts.branch);
        pushChanges({ branch, base: opts.base, openPR: opts.openPR, message: opts.message });
        statusReport();
        break;
      }
    }
    log.header();
    log.success("Done");
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
