import { useState } from "react";
import { Thermometer, Copy, Check, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type Unit = "celsius" | "fahrenheit" | "kelvin";

const labels: Record<Unit, string> = {
  celsius: "Celsius (°C)",
  fahrenheit: "Fahrenheit (°F)",
  kelvin: "Kelvin (K)",
};

function toCelsius(value: number, unit: Unit): number {
  if (unit === "fahrenheit") return (value - 32) * (5 / 9);
  if (unit === "kelvin") return value - 273.15;
  return value;
}

function fromCelsius(c: number, unit: Unit): number {
  if (unit === "fahrenheit") return c * (9 / 5) + 32;
  if (unit === "kelvin") return c + 273.15;
  return c;
}

function TemperatureConverterTool() {
  const [unit, setUnit] = useState<Unit>("celsius");
  const [value, setValue] = useState("25");
  const [copied, setCopied] = useState<Unit | null>(null);

  const numeric = Number(value);
  const valid = value.trim() !== "" && !Number.isNaN(numeric);
  const celsius = valid ? toCelsius(numeric, unit) : null;

  const outputs: Unit[] = ["celsius", "fahrenheit", "kelvin"].filter((u) => u !== unit) as Unit[];

  const copy = (u: Unit, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(u);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">From unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {(Object.keys(labels) as Unit[]).map((u) => (
              <option key={u} value={u}>
                {labels[u]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {outputs.map((u) => {
          const result = celsius === null ? null : fromCelsius(celsius, u);
          const text =
            result === null
              ? "—"
              : `${Number(result.toFixed(4))} ${u === "celsius" ? "°C" : u === "fahrenheit" ? "°F" : "K"}`;
          return (
            <div key={u} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">{labels[u]}</label>
                <button
                  type="button"
                  onClick={() => copy(u, text)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {copied === u ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied === u ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
                {text}
              </div>
            </div>
          );
        })}
      </div>

      {celsius !== null && celsius < -273.15 && (
        <p className="text-xs text-destructive">
          This value is below absolute zero (−273.15 °C) and is physically impossible.
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setUnit("celsius");
          setValue("25");
        }}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </button>
    </div>
  );
}

export const TemperatureConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "temperature-converter",
  slug: "temperature-converter",
  categoryId: "converters",
  icon: Thermometer,
  component: TemperatureConverterTool,
  layoutDescription:
    "Convert temperatures instantly between Celsius, Fahrenheit, and Kelvin with absolute-zero validation.",
};
