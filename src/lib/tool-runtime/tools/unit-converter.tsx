import { useState } from "react";
import { ArrowRightLeft, Copy, Check } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type CategoryKey = "length" | "weight" | "temperature" | "area" | "volume" | "speed";

const UNITS: Record<
  CategoryKey,
  Record<string, { name: string; toBase: (v: number) => number; fromBase: (v: number) => number }>
> = {
  length: {
    m: { name: "Meters (m)", toBase: (v) => v, fromBase: (v) => v },
    km: { name: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    cm: { name: "Centimeters (cm)", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    mm: { name: "Millimeters (mm)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    mi: { name: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ft: { name: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    inch: { name: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  },
  weight: {
    kg: { name: "Kilograms (kg)", toBase: (v) => v, fromBase: (v) => v },
    g: { name: "Grams (g)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    mg: { name: "Milligrams (mg)", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    lb: { name: "Pounds (lbs)", toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    oz: { name: "Ounces (oz)", toBase: (v) => v * 0.0283495231, fromBase: (v) => v / 0.0283495231 },
  },
  temperature: {
    c: { name: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
    f: {
      name: "Fahrenheit (°F)",
      toBase: (v) => (v - 32) * (5 / 9),
      fromBase: (v) => v * (9 / 5) + 32,
    },
    k: { name: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  },
  area: {
    sqm: { name: "Square Meters (m²)", toBase: (v) => v, fromBase: (v) => v },
    sqkm: { name: "Square Kilometers (km²)", toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
    sqft: { name: "Square Feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
    acre: { name: "Acres", toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
    ha: { name: "Hectares (ha)", toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  },
  volume: {
    l: { name: "Liters (L)", toBase: (v) => v, fromBase: (v) => v },
    ml: { name: "Milliliters (mL)", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    gal: { name: "Gallons (US)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    cup: { name: "Cups (US)", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
  },
  speed: {
    kmh: { name: "Km / Hour (km/h)", toBase: (v) => v, fromBase: (v) => v },
    mph: { name: "Miles / Hour (mph)", toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
    ms: { name: "Meters / Second (m/s)", toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
    knot: { name: "Knots (kt)", toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 },
  },
};

function UnitConverterTool() {
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [value, setValue] = useState("10");
  const [copied, setCopied] = useState(false);

  const categoryUnits = UNITS[category];

  const handleCategoryChange = (cat: CategoryKey) => {
    setCategory(cat);
    const keys = Object.keys(UNITS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const numVal = parseFloat(value) || 0;
  const fromDef = categoryUnits[fromUnit] || Object.values(categoryUnits)[0];
  const toDef = categoryUnits[toUnit] || Object.values(categoryUnits)[1];

  const baseVal = fromDef.toBase(numVal);
  const result = toDef.fromBase(baseVal);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result.toFixed(4)} ${toDef.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {(Object.keys(UNITS) as CategoryKey[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-5 items-center">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-foreground">From</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground"
          >
            {Object.entries(categoryUnits).map(([k, u]) => (
              <option key={k} value={k}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center md:pt-6">
          <button
            type="button"
            onClick={handleSwap}
            className="p-3 rounded-full border border-border bg-background hover:bg-muted text-primary transition-colors"
          >
            <ArrowRightLeft className="size-5" />
          </button>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-foreground">To (Result)</label>
          <div className="w-full rounded-xl border border-border bg-background/50 p-3 text-lg font-bold text-primary flex items-center justify-between">
            <span>{result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-muted-foreground hover:text-foreground font-normal flex items-center gap-1"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground"
          >
            {Object.entries(categoryUnits).map(([k, u]) => (
              <option key={k} value={k}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export const UnitConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "unit-converter",
  slug: "unit-converter",
  categoryId: "converters",
  icon: ArrowRightLeft,
  component: UnitConverterTool,
  layoutDescription:
    "Convert between units of length, weight, temperature, area, volume, and speed.",
};
