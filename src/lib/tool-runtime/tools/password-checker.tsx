import { useState, useMemo } from "react";
import { ShieldCheck, ShieldAlert, RotateCcw, Copy, Check } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

interface StrengthResult {
  score: number;
  label: string;
  entropy: number;
  crackTime: string;
  checks: { label: string; passed: boolean }[];
  suggestions: string[];
}

const COMMON = new Set([
  "password",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "111111",
  "12345678",
  "password1",
  "admin",
  "letmein",
  "welcome",
  "iloveyou",
]);

function crackTimeEstimate(entropy: number): string {
  const guessesPerSecond = 1e10;
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / guessesPerSecond;
  if (seconds < 1) return "instant";
  const units: [number, string][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [365, "days"],
    [100, "years"],
    [1000, "centuries"],
  ];
  let value = seconds;
  let unit = "seconds";
  for (const [factor, name] of units) {
    if (value < factor) {
      unit = name;
      break;
    }
    value /= factor;
    unit = name;
  }
  if (unit === "centuries" && value > 1e6) return "millennia";
  return `${value < 1 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

function analyzePassword(password: string): StrengthResult {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  const entropy = password.length > 0 ? Math.log2(charsetSize) * password.length : 0;

  const checks = [
    { label: "At least 12 characters", passed: password.length >= 12 },
    { label: "Upper & lower case", passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Contains numbers", passed: /[0-9]/.test(password) },
    { label: "Contains symbols", passed: /[^a-zA-Z0-9]/.test(password) },
    { label: "No common patterns", passed: !COMMON.has(password.toLowerCase()) },
  ];

  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push("Use at least 12 characters.");
  if (!/[A-Z]/.test(password)) suggestions.push("Add uppercase letters.");
  if (!/[0-9]/.test(password)) suggestions.push("Include numbers.");
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push("Add special symbols.");
  if (COMMON.has(password.toLowerCase())) suggestions.push("Avoid common passwords.");

  const passedCount = checks.filter((c) => c.passed).length;
  let score: number;
  if (password.length === 0) score = 0;
  else if (entropy < 28) score = 1;
  else if (entropy < 36) score = 2;
  else if (entropy < 60) score = 3;
  else if (entropy < 80) score = 4;
  else score = 5;
  if (COMMON.has(password.toLowerCase())) score = Math.min(score, 1);

  const labels = ["—", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
  void passedCount;

  return {
    score,
    label: labels[score],
    entropy: Math.round(entropy),
    crackTime: crackTimeEstimate(entropy),
    checks,
    suggestions,
  };
}

function PasswordCheckerTool() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyzePassword(password), [password]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPassword("");
    setCopied(false);
  };

  const barColors = [
    "bg-muted",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Password to check</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {show ? "Hide" : "Show"}
            </button>
            {password && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Clear
            </button>
          </div>
        </div>
        <input
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type or paste a password to evaluate..."
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoComplete="off"
        />
      </div>

      {password && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.score >= 4 ? (
                  <ShieldCheck className="size-5 text-emerald-500" />
                ) : (
                  <ShieldAlert className="size-5 text-orange-500" />
                )}
                <span className="text-sm font-semibold text-foreground">{result.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {result.entropy} bits of entropy
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= result.score ? barColors[result.score] : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated time to crack:{" "}
              <span className="font-semibold text-foreground">{result.crackTime}</span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Checks</span>
              <ul className="space-y-1.5">
                {result.checks.map((check) => (
                  <li key={check.label} className="flex items-center gap-2 text-xs">
                    <span
                      className={`size-3.5 rounded-full ${
                        check.passed ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                      {check.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Suggestions
                </span>
                <ul className="space-y-1.5">
                  {result.suggestions.map((s) => (
                    <li key={s} className="text-xs text-muted-foreground">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export const PasswordCheckerRuntime: ReadyToolRuntimeDefinition = {
  toolId: "password-checker",
  slug: "password-checker",
  categoryId: "utilities",
  icon: ShieldCheck,
  component: PasswordCheckerTool,
  layoutDescription:
    "Check password strength, entropy, and estimated crack time with actionable improvement tips.",
};
