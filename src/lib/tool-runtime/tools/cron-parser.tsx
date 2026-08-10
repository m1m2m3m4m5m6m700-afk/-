import { useState } from "react";
import { Clock, Copy, Check, RotateCcw, CalendarRange, AlertCircle } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

interface CronField {
  name: string;
  min: number;
  max: number;
}

const FIELDS: CronField[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12 },
  { name: "day of week", min: 0, max: 7 },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ParsedField {
  raw: string;
  description: string;
}

function describeField(raw: string, field: CronField): ParsedField {
  const value = raw.trim();
  if (value === "*") return { raw, description: `every ${field.name}` };

  // Step values: */n or a-b/n
  const stepMatch = value.match(/^(\*|\d+-\d+)\/(\d+)$/);
  if (stepMatch) {
    const step = Number(stepMatch[2]);
    if (stepMatch[1] === "*") {
      return { raw, description: `every ${step} ${field.name}${step === 1 ? "" : "s"}` };
    }
    const [start, end] = stepMatch[1].split("-").map(Number);
    return {
      raw,
      description: `every ${step} ${field.name}${step === 1 ? "" : "s"} from ${start} through ${end}`,
    };
  }

  // Range: a-b
  const rangeMatch = value.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, start, end] = rangeMatch;
    return {
      raw,
      description: `every ${field.name} from ${start} through ${end}`,
    };
  }

  // List: a,b,c
  if (value.includes(",")) {
    const parts = value.split(",").map((p) => p.trim());
    return {
      raw,
      description: `at ${field.name} ${parts.join(", ")}`,
    };
  }

  // Single number
  const num = Number(value);
  if (!Number.isNaN(num)) {
    if (field.name === "day of week") {
      const dayName = num === 7 ? DAYS[0] : (DAYS[num] ?? value);
      return { raw, description: `on ${dayName}` };
    }
    if (field.name === "month") {
      return { raw, description: `in ${MONTHS[num - 1] ?? value}` };
    }
    return { raw, description: `at ${field.name} ${value}` };
  }

  return { raw, description: value };
}

function buildSummary(parsed: ParsedField[]): string {
  const [min, hour, dom, month, dow] = parsed;
  const parts: string[] = [];

  if (min.raw !== "*" || hour.raw !== "*") {
    parts.push(
      `At ${hour.raw !== "*" ? hour.raw.padStart(2, "0") : "every"}:${min.raw !== "*" ? min.raw.padStart(2, "0") : "00"}`,
    );
  } else {
    parts.push("Every minute");
  }

  if (dom.raw !== "*" && dow.raw === "*") {
    parts.push(`on day ${dom.raw} of the month`);
  } else if (dom.raw === "*" && dow.raw !== "*") {
    parts.push(dow.description);
  } else if (dom.raw !== "*" && dow.raw !== "*") {
    parts.push(`on day ${dom.raw} of the month (${dow.description})`);
  }

  if (month.raw !== "*") {
    parts.push(month.description);
  }

  return parts.join(" ");
}

interface ParseResult {
  valid: boolean;
  fields: ParsedField[];
  summary: string;
  error?: string;
}

function parseCron(expression: string): ParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { valid: false, fields: [], summary: "", error: "Enter a cron expression." };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      fields: [],
      summary: "",
      error: `Expected 5 fields, got ${parts.length}.`,
    };
  }
  const fields: ParsedField[] = [];
  for (let i = 0; i < 5; i++) {
    const raw = parts[i];
    const field = FIELDS[i];
    // Validate each token
    const tokens = raw.split(",");
    for (const token of tokens) {
      const stepMatch = token.match(/^(\*|\d+-\d+)\/(\d+)$/);
      const rangeMatch = token.match(/^(\d+)-(\d+)$/);
      if (token === "*") continue;
      if (stepMatch) {
        const step = Number(stepMatch[2]);
        if (step < 1) {
          return { valid: false, fields: [], summary: "", error: `Step must be >= 1 in "${raw}".` };
        }
        if (stepMatch[1] !== "*") {
          const [s, e] = stepMatch[1].split("-").map(Number);
          if (s < field.min || e > field.max) {
            return {
              valid: false,
              fields: [],
              summary: "",
              error: `${field.name} range ${s}-${e} out of bounds (${field.min}-${field.max}).`,
            };
          }
        }
        continue;
      }
      if (rangeMatch) {
        const [, s, e] = rangeMatch.map(Number);
        if (s < field.min || e > field.max || s > e) {
          return {
            valid: false,
            fields: [],
            summary: "",
            error: `${field.name} range ${raw} out of bounds (${field.min}-${field.max}).`,
          };
        }
        continue;
      }
      const num = Number(token);
      if (
        Number.isNaN(num) ||
        num < field.min ||
        (field.name === "day of week" ? num > 7 : num > field.max)
      ) {
        return {
          valid: false,
          fields: [],
          summary: "",
          error: `Invalid ${field.name} value "${raw}" (allowed ${field.min}-${field.max}).`,
        };
      }
    }
    fields.push(describeField(raw, field));
  }
  return { valid: true, fields, summary: buildSummary(fields) };
}

function nextRuns(expression: string, count = 5): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [minF, hourF, domF, monthF, dowF] = parts;
  const matches = (value: number, field: string, f: CronField): boolean => {
    if (field === "*") return true;
    for (const token of field.split(",")) {
      const stepMatch = token.match(/^(\*|\d+-\d+)\/(\d+)$/);
      if (stepMatch) {
        const step = Number(stepMatch[2]);
        const base = stepMatch[1] === "*" ? [f.min, f.max] : stepMatch[1].split("-").map(Number);
        if (value >= base[0] && value <= base[1] && (value - base[0]) % step === 0) return true;
        continue;
      }
      const rangeMatch = token.match(/^(\d+)-(\d+)$/);
      if (rangeMatch) {
        const [, s, e] = rangeMatch.map(Number);
        if (value >= s && value <= e) return true;
        continue;
      }
      const num = Number(token);
      if (f.name === "day of week" && num === 7) {
        if (value === 0) return true;
        continue;
      }
      if (value === num) return true;
    }
    return false;
  };

  const runs: Date[] = [];
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  const limit = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  while (runs.length < count && now < limit) {
    const min = now.getMinutes();
    const hour = now.getHours();
    const dom = now.getDate();
    const month = now.getMonth() + 1;
    const dow = now.getDay();
    if (
      matches(min, minF, FIELDS[0]) &&
      matches(hour, hourF, FIELDS[1]) &&
      matches(dom, domF, FIELDS[2]) &&
      matches(month, monthF, FIELDS[3]) &&
      matches(dow, dowF, FIELDS[4])
    ) {
      runs.push(new Date(now));
    }
    now.setMinutes(now.getMinutes() + 1);
  }
  return runs;
}

const EXAMPLES = ["*/5 * * * *", "0 * * * *", "0 0 * * *", "0 0 * * 0", "0 9 * * 1-5", "0 0 1 * *"];

function CronParserTool() {
  const [input, setInput] = useState("*/5 * * * *");
  const [result, setResult] = useState<ParseResult>(() => parseCron("*/5 * * * *"));
  const [upcoming, setUpcoming] = useState<Date[]>([]);
  const [copied, setCopied] = useState(false);

  const handleParse = () => {
    const parsed = parseCron(input);
    setResult(parsed);
    setUpcoming(parsed.valid ? nextRuns(input) : []);
  };

  const handleCopy = () => {
    if (!result.valid) return;
    const text = `${result.summary}\n\n${result.fields.map((f) => `${f.raw} → ${f.description}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput("");
    setResult({ valid: false, fields: [], summary: "" });
    setUpcoming([]);
    setCopied(false);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Examples:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setInput(ex);
                const parsed = parseCron(ex);
                setResult(parsed);
                setUpcoming(parsed.valid ? nextRuns(ex) : []);
              }}
              className="px-2 py-1 text-[11px] font-mono rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleParse}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <CalendarRange className="size-3.5" />
          Parse Cron
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Cron Expression</label>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </button>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="minute hour day-of-month month day-of-week"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-[11px] text-muted-foreground">
          Format: minute hour day-of-month month day-of-week. Use * for "any", */n for steps, a-b
          for ranges.
        </p>
      </div>

      {result.error ? (
        <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-xs">Invalid Expression</div>
            <div className="text-[11px] opacity-90 mt-0.5">{result.error}</div>
          </div>
        </div>
      ) : null}

      {result.valid && (
        <>
          <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Human-readable summary
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-sm text-foreground capitalize">{result.summary}</p>
            <div className="grid gap-2 sm:grid-cols-5 pt-2 border-t border-border">
              {result.fields.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-mono text-xs font-semibold text-primary">{f.raw}</div>
                  <div className="text-[11px] text-muted-foreground capitalize">
                    {f.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {upcoming.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold text-foreground">Next 5 runs</span>
              <ul className="space-y-1.5">
                {upcoming.map((date, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
                  >
                    {date.toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const CronParserRuntime: ReadyToolRuntimeDefinition = {
  toolId: "cron-parser",
  slug: "cron-parser",
  categoryId: "developer",
  icon: CalendarRange,
  component: CronParserTool,
  layoutDescription:
    "Translate cron expressions into plain language with field breakdowns and upcoming run times.",
};
