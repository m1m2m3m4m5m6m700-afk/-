import { useState } from "react";
import { CalendarDays, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function diffYMD(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function AgeCalculatorTool() {
  const [birth, setBirth] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalMonths: number;
    totalWeeks: number;
    totalHours: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    if (!birth) {
      setError("Please enter your date of birth.");
      setResult(null);
      return;
    }
    const from = new Date(birth + "T00:00:00");
    const to = target ? new Date(target + "T00:00:00") : new Date();
    if (Number.isNaN(from.getTime())) {
      setError("Invalid date of birth.");
      setResult(null);
      return;
    }
    if (Number.isNaN(to.getTime())) {
      setError("Invalid target date.");
      setResult(null);
      return;
    }
    if (from > to) {
      setError("The date of birth cannot be after the target date.");
      setResult(null);
      return;
    }
    setError(null);
    const { years, months, days } = diffYMD(from, to);
    const ms = to.getTime() - from.getTime();
    setResult({
      years,
      months,
      days,
      totalDays: Math.floor(ms / 86400000),
      totalMonths: years * 12 + months,
      totalWeeks: Math.floor(ms / (86400000 * 7)),
      totalHours: Math.floor(ms / 3600000),
    });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Date of birth
          </label>
          <input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Age at date (optional)
          </label>
          <input
            type="date"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={calculate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <CalendarDays className="size-3.5" />
          Calculate Age
        </button>
        <button
          type="button"
          onClick={() => {
            setBirth("");
            setTarget("");
            setResult(null);
            setError(null);
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-3.5" />
          Clear
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result && (
        <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Your age</div>
            <div className="text-2xl font-bold text-foreground">
              {result.years} years, {result.months} months, {result.days} days
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total months", value: result.totalMonths },
              { label: "Total weeks", value: result.totalWeeks },
              { label: "Total days", value: result.totalDays },
              { label: "Total hours", value: result.totalHours },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-card px-3 py-2 text-center"
              >
                <div className="text-lg font-bold text-foreground">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const AgeCalculatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "age-calculator",
  slug: "age-calculator",
  categoryId: "calculators",
  icon: CalendarDays,
  component: AgeCalculatorTool,
  layoutDescription:
    "Calculate exact age in years, months, and days from a birthdate, plus totals in weeks, days, and hours.",
};
