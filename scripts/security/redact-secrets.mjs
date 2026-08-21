const SECRET_PATTERNS = [
  /([A-Za-z_][A-Za-z0-9_]*(?:TOKEN|KEY|SECRET|PASSWORD|AUTH|COOKIE|CREDENTIAL)[A-Za-z0-9_]*)\s*[:=]\s*([^\s,;]+)/gi,
  /(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi,
  /(ghp_|gho_|github_pat_|sk-[A-Za-z0-9_-]{10,})[A-Za-z0-9._-]*/g,
];

export function redactSecrets(input) {
  if (typeof input !== "string") return input;
  let output = input;
  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, (match, prefix) => `${prefix ?? match}[REDACTED]`);
  }
  return output;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(redactSecrets(process.argv.slice(2).join(" ")));
}
