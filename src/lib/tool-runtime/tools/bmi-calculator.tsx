import { useState } from "react";
import { Scale, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type System = "metric" | "imperial";

function categoryFor(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal weight", color: "text-emerald-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600" };
  return { label: "Obese", color: "text-destructive" };
}

function BmiCalculatorTool() {
  const [system, setSystem] = useState<System>("metric");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || Number.isNaN(h) || Number.isNaN(w) || h <= 0 || w <= 0) {
      setResult(null);
      return;
    }
    let bmi: number;
    if (system === "metric") {
      bmi = w / Math.pow(h / 100, 2);
    } else {
      bmi = (w / Math.pow(h, 2)) * 703;
    }
    setResult(Number(bmi.toFixed(1)));
  };

  const cat = result === null ? null : categoryFor(result);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex rounded-xl border border-border p-1 bg-background w-fit">
        {(["metric", "imperial"] as System[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSystem(s);
              setResult(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              system === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Height {system === "metric" ? "(cm)" : "(in)"}
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={system === "metric" ? "175" : "69"}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Weight {system === "metric" ? "(kg)" : "(lb)"}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={system === "metric" ? "70" : "154"}
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
          <Scale className="size-3.5" />
          Calculate BMI
        </button>
        <button
          type="button"
          onClick={() => {
            setHeight("");
            setWeight("");
            setResult(null);
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-3.5" />
          Clear
        </button>
      </div>

      {result !== null && cat && (
        <div className="rounded-2xl border border-border bg-background p-5 space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Your BMI</div>
          <div className="text-4xl font-bold text-foreground">{result}</div>
          <div className={`text-sm font-semibold ${cat.color}`}>{cat.label}</div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-blue-500/10 py-2 text-blue-600">
              &lt;18.5
              <div className="font-semibold">Under</div>
            </div>
            <div className="rounded-lg bg-emerald-600/10 py-2 text-emerald-700">
              18.5–24.9
              <div className="font-semibold">Normal</div>
            </div>
            <div className="rounded-lg bg-amber-600/10 py-2 text-amber-700">
              25–29.9
              <div className="font-semibold">Over</div>
            </div>
            <div className="rounded-lg bg-destructive/10 py-2 text-destructive">
              30+
              <div className="font-semibold">Obese</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const BmiCalculatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "bmi-calculator",
  slug: "bmi-calculator",
  categoryId: "calculators",
  icon: Scale,
  component: BmiCalculatorTool,
  layoutDescription:
    "Calculate Body Mass Index from height and weight in metric or imperial units with a healthy-range breakdown.",
};
