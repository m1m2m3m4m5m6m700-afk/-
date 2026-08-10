import { useState } from "react";
import { Percent, Copy, Check } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function PercentageCalculatorTool() {
  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState("15");
  const [m1Y, setM1Y] = useState("200");
  const r1 = ((parseFloat(m1X) || 0) / 100) * (parseFloat(m1Y) || 0);

  // Mode 2: X is what percent of Y?
  const [m2X, setM2X] = useState("30");
  const [m2Y, setM2Y] = useState("150");
  const r2 =
    (parseFloat(m2Y) || 0) !== 0 ? ((parseFloat(m2X) || 0) / (parseFloat(m2Y) || 1)) * 100 : 0;

  // Mode 3: Percentage increase / decrease from X to Y
  const [m3X, setM3X] = useState("100");
  const [m3Y, setM3Y] = useState("125");
  const diff3 = (parseFloat(m3Y) || 0) - (parseFloat(m3X) || 0);
  const r3 = (parseFloat(m3X) || 0) !== 0 ? (diff3 / (parseFloat(m3X) || 1)) * 100 : 0;

  const [copiedMode, setCopiedMode] = useState<number | null>(null);

  const handleCopy = (val: string, mode: number) => {
    navigator.clipboard.writeText(val);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      {/* Calculation 1 */}
      <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">1. What is X% of Y?</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>What is</span>
          <input
            type="number"
            value={m1X}
            onChange={(e) => setM1X(e.target.value)}
            className="w-24 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>% of</span>
          <input
            type="number"
            value={m1Y}
            onChange={(e) => setM1Y(e.target.value)}
            className="w-28 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>=</span>
          <span className="font-bold text-primary text-lg bg-primary/10 px-3 py-1 rounded-lg">
            {r1.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(r1.toString(), 1)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {copiedMode === 1 ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Calculation 2 */}
      <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">2. X is what percentage of Y?</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <input
            type="number"
            value={m2X}
            onChange={(e) => setM2X(e.target.value)}
            className="w-24 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>is what % of</span>
          <input
            type="number"
            value={m2Y}
            onChange={(e) => setM2Y(e.target.value)}
            className="w-28 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>=</span>
          <span className="font-bold text-primary text-lg bg-primary/10 px-3 py-1 rounded-lg">
            {r2.toFixed(2)}%
          </span>
          <button
            type="button"
            onClick={() => handleCopy(`${r2.toFixed(2)}%`, 2)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {copiedMode === 2 ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Calculation 3 */}
      <div className="rounded-2xl border border-border bg-background p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">3. Percentage Change from X to Y</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>From</span>
          <input
            type="number"
            value={m3X}
            onChange={(e) => setM3X(e.target.value)}
            className="w-24 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>to</span>
          <input
            type="number"
            value={m3Y}
            onChange={(e) => setM3Y(e.target.value)}
            className="w-28 rounded-lg border border-border bg-card p-2 text-center text-foreground font-semibold"
          />
          <span>=</span>
          <span
            className={`font-bold text-lg px-3 py-1 rounded-lg ${r3 >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}
          >
            {r3 >= 0 ? `+${r3.toFixed(2)}%` : `${r3.toFixed(2)}%`}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(`${r3.toFixed(2)}%`, 3)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {copiedMode === 3 ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const PercentageCalculatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "percentage-calculator",
  slug: "percentage-calculator",
  categoryId: "calculators",
  icon: Percent,
  component: PercentageCalculatorTool,
  layoutDescription:
    "Calculate percentages, percentage change, ratios, and proportion increases/decreases.",
};
