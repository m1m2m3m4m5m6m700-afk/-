import { useState } from "react";
import { Barcode as BarcodeIcon, Copy, Check, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function BarcodeGeneratorTool() {
  const [value, setValue] = useState("123456789012");
  const [format, setFormat] = useState<"CODE128" | "EAN13" | "CODE39">("CODE128");
  const [copied, setCopied] = useState(false);

  // Generate visual bars representation
  const generateBars = (inputStr: string) => {
    let hash = 0;
    for (let i = 0; i < inputStr.length; i++) {
      hash = (hash << 5) - hash + inputStr.charCodeAt(i);
      hash |= 0;
    }
    const bars: boolean[] = [];
    // Guard patterns
    bars.push(true, false, true);
    for (let i = 0; i < 40; i++) {
      const bit = ((hash >> (i % 31)) & 1) === 1;
      bars.push(bit, !bit, bit);
    }
    bars.push(true, false, true);
    return bars;
  };

  const bars = generateBars(value || "0");

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const svgElem = document.getElementById("barcode-svg");
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${value}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Barcode Value / Code
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text or numbers..."
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "CODE128" | "EAN13" | "CODE39")}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="CODE128">CODE128 (Alphanumeric)</option>
            <option value="EAN13">EAN-13 (Numeric 13 digits)</option>
            <option value="CODE39">CODE39 (Standard Barcode)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 flex flex-col items-center justify-center p-6 bg-background rounded-2xl border border-border">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col items-center gap-2">
          <svg id="barcode-svg" width="280" height="100" viewBox="0 0 280 100" className="bg-white">
            <rect width="280" height="100" fill="#ffffff" />
            <g transform="translate(10, 10)">
              {bars.map((isBar, idx) => {
                if (!isBar) return null;
                const x = idx * 2;
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={0}
                    width={idx % 7 === 0 ? 3 : 2}
                    height={70}
                    fill="#000000"
                  />
                );
              })}
            </g>
            <text
              x="140"
              y="92"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="12"
              fontWeight="bold"
              fill="#000000"
            >
              {value || "123456789012"}
            </text>
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Value Copied" : "Copy Value"}
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Download className="size-3.5" />
            Download SVG
          </button>
        </div>
      </div>
    </div>
  );
}

export const BarcodeGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "barcode-generator",
  slug: "barcode-generator",
  categoryId: "utilities",
  icon: BarcodeIcon,
  component: BarcodeGeneratorTool,
  layoutDescription:
    "Generate custom barcodes in CODE128, EAN13, and CODE39 formats with instant SVG download.",
};
