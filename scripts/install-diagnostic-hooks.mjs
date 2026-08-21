import { chmod, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, ".githooks", "pre-commit");
const hooks = resolve(root, ".git", "hooks");
const target = resolve(hooks, "pre-commit");

await mkdir(hooks, { recursive: true });
await copyFile(source, target);
await chmod(target, 0o755);
console.log(`Installed FLIXO diagnostic pre-commit hook: ${target}`);
