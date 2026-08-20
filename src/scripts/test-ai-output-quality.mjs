import fs from "node:fs/promises";

const corpus = JSON.parse(await fs.readFile("tests/fixtures/ai-output-quality.json", "utf8"));
const failures = [];
const fail = (message) => failures.push(message);

function asText(output) {
  return typeof output === "string" ? output.trim() : "";
}

function evaluateCase(testCase) {
  const output = testCase.output;
  if (testCase.kind === "error") {
    if (!output || typeof output !== "object") return "error result must be an object";
    if (typeof output.error !== "string" || !output.error.trim()) return "error result must contain a non-empty error";
    if (typeof output.retryable !== "boolean") return "error result must contain retryable:boolean";
    return null;
  }

  const text = asText(output);
  if (!text) return "result must not be empty";
  if (Array.isArray(testCase.requiredSubstrings)) {
    for (const value of testCase.requiredSubstrings) if (!text.toLocaleLowerCase().includes(String(value).toLocaleLowerCase())) return `missing required content: ${value}`;
  }
  if (Array.isArray(testCase.forbiddenPatterns)) {
    for (const value of testCase.forbiddenPatterns) if (text.toLocaleLowerCase().includes(String(value).toLocaleLowerCase())) return `forbidden claim/content present: ${value}`;
  }
  if (Number.isFinite(testCase.maxOutputRatio) && testCase.input) {
    const ratio = text.length / testCase.input.length;
    if (ratio > testCase.maxOutputRatio) return `output ratio ${ratio.toFixed(2)} exceeds ${testCase.maxOutputRatio}`;
  }
  if (testCase.toolEvidence === false && /(i ran|i merged|file is ready|tool executed)/i.test(text)) return "tool claim requires tool evidence";
  return null;
}

for (const testCase of corpus.cases ?? []) {
  const error = evaluateCase(testCase);
  if (error) fail(`${testCase.id}: ${error}`);
}

for (const negative of corpus.negativeCases ?? []) {
  const error = evaluateCase(negative);
  if (!error) fail(`${negative.id}: negative fixture unexpectedly passed quality evaluation`);
}

if (!Number.isInteger(corpus.schemaVersion) || corpus.schemaVersion < 1) fail("quality corpus must declare schemaVersion >= 1");
if ((corpus.cases ?? []).length < 3) fail("quality corpus must contain at least 3 positive cases");
if ((corpus.negativeCases ?? []).length < 2) fail("quality corpus must contain at least 2 negative cases");

if (failures.length) {
  console.error("AI RESULT QUALITY GATE: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`AI RESULT QUALITY GATE: PASS (${corpus.cases.length} positive + ${corpus.negativeCases.length} negative regression cases)`);
console.log("NOTE: This deterministic gate validates the quality evaluator and regression rules; live provider quality still requires a live smoke run.");
