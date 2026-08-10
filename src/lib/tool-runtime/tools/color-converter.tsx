import { useState } from "react";
import { Palette, Copy, Check, RotateCcw } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function clamp255(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) => clamp255(n).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function ColorConverterTool() {
  const [hex, setHex] = useState("#3b82f6");
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyHex = (value: string) => {
    setHex(value);
    const rgb = hexToRgb(value);
    if (rgb) {
      setR(rgb.r);
      setG(rgb.g);
      setB(rgb.b);
      setError(null);
    } else {
      setError("Enter a valid HEX like #3b82f6 or 3b82f6.");
    }
  };

  const applyRgb = (nr: number, ng: number, nb: number) => {
    setR(nr);
    setG(ng);
    setB(nb);
    setHex(rgbToHex(nr, ng, nb));
    setError(null);
  };

  const hsl = rgbToHsl(r, g, b);
  const rgbString = `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">HEX</label>
            <div className="flex items-center gap-2">
              <input
                value={hex}
                onChange={(e) => applyHex(e.target.value)}
                placeholder="#3b82f6"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => copy("hex", hex)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {copied === "hex" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied === "hex" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">RGB</label>
            <div className="flex flex-wrap items-center gap-2">
              {(["r", "g", "b"] as const).map((ch, i) => {
                const val = [r, g, b][i];
                const setVal = [setR, setG, setB][i];
                return (
                  <div key={ch} className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                      {ch}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={val}
                      onChange={(e) =>
                        applyRgb(
                          i === 0 ? Number(e.target.value) : r,
                          i === 1 ? Number(e.target.value) : g,
                          i === 2 ? Number(e.target.value) : b,
                        )
                      }
                      className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => copy("rgb", rgbString)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {copied === "rgb" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied === "rgb" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">HSL</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={hslString}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => copy("hsl", hslString)}
                className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {copied === "hsl" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied === "hsl" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            className="size-32 rounded-2xl border border-border shadow-sm"
            style={{ backgroundColor: hex }}
          />
          <button
            type="button"
            onClick={() => applyHex("#3b82f6")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export const ColorConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "color-converter",
  slug: "color-converter",
  categoryId: "developer",
  icon: Palette,
  component: ColorConverterTool,
  layoutDescription:
    "Convert color values live between HEX, RGB, and HSL with an instant preview swatch.",
};
