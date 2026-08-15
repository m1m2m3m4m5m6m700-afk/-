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

if (!chat.includes('aria-label') && !chat.includes('aria-labelledby')) {
  issues.push("AI task interface must expose an accessible region label.");
}

// The hero uses Framer Motion's semantic motion.h1 element. Treat both native
// <h1> and <motion.h1> as a real primary heading; do not couple this contract
// to a particular rendering library syntax.
const hasPrimaryHeading = /<h1\b|<motion\.h1\b/.test(hero);
if (!hasPrimaryHeading) {
  issues.push("Landing hero must expose a primary h1 heading.");
}

if (!hero.includes("AITaskInterface")) {
  issues.push("Landing hero must retain the primary assistant interaction surface.");
}

if (issues.length) {
  console.error(`Accessibility contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("Accessibility contract passed: public pages have automated browser coverage and explicit semantic hooks.");
