/**
 * Small utilities used by the patch & sync helper.
 */

import fs from "node:fs";
import path from "node:path";

/** Replace `pattern` with `replacement` in the given files. Returns the count of files changed. */
export function updateDateInFiles(files, pattern, replacement) {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const updated = content.replace(pattern, replacement);
    if (content !== updated) {
      fs.writeFileSync(file, updated, "utf8");
      count += 1;
    }
  }
  return count;
}

/** Recursively walk `dir` and return files whose name matches `pattern` (RegExp). */
export function findFiles(pattern, dir = "src") {
  const files = [];
  const fullPath = path.join(process.cwd(), dir);
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const item of fs.readdirSync(directory)) {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) walk(itemPath);
      else if (pattern instanceof RegExp ? pattern.test(item) : item.match(pattern)) {
        files.push(itemPath);
      }
    }
  }
  walk(fullPath);
  return files;
}

/** Read a JSON config file from the scripts directory, or return `{}` if missing. */
export function loadConfig(configPath = "patch-config.json") {
  const fullPath = path.join(process.cwd(), "scripts", configPath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  }
  return {};
}

/** Human-readable file size. */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
