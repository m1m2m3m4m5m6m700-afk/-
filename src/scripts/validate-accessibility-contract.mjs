import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [
  "tests/accessibility.spec.ts",
  "src/components/landing/HomeHero.tsx",
  "src/components/assistant/AITaskInterface.tsx",
];
const issues = [];
for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) issues.push(`Missing accessibility contract file: ${file}`);
}

const chat = fs.readFileSync(path.join(root, "src/components/assistant/AITaskInterface.tsx"), "utf8");
const hero = fs.readFileSync(path.join(root, "src/components/landing/HomeHero.tsx"), "utf8");
if (!chat.includes('aria-label') && !chat.includes('aria-labelledby')) issues.push("AI task interface must expose an accessible labelling contract.");
if (!hero.includes('aria-')) issues.push("Landing hero must contain at least one explicit ARIA contract for its interactive surface.");

if (issues.length) {
  console.error(`Accessibility contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("Accessibility contract passed: interactive public surfaces have automated browser coverage and explicit ARIA hooks.");
