import { useState } from "react";
import { Hash, Copy, Check, RefreshCw, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

/** Fill an array of random hex digits using the Web Crypto API (CSPRNG).
 * Falls back to crypto.randomUUID when available, otherwise getRandomValues. */
function randomHex(byteCount: number): string {
  const arr = new Uint8Array(byteCount);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function generateUUIDv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 layout using a CSPRNG (never Math.random).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function generateUUIDv1(): string {
  const now = new Date().getTime();
  const timeHex = now.toString(16).padStart(12, "0");
  // Clock sequence + node come from the CSPRNG, not Math.random.
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-11e1-a832-${randomHex(6)}`;
}

function UuidGeneratorTool() {
  const [version, setVersion] = useState<"v4" | "v1">("v4");
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let raw = version === "v4" ? generateUUIDv4() : generateUUIDv1();
      if (!hyphens) raw = raw.replace(/-/g, "");
      if (uppercase) raw = raw.toUpperCase();
      list.push(raw);
    }
    setUuids(list);
  };

  const textToCopy = uuids.join("\n");

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!textToCopy) return;
    const blob = new Blob([textToCopy], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${version}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Version</label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as "v4" | "v1")}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="v4">UUID v4 (Random)</option>
            <option value="v1">UUID v1 (Timestamp)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Quantity (1 - 100)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-2 pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Uppercase
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground font-medium">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            Include Hyphens (-)
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="size-3.5" />
          Generate UUIDs
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Generated UUIDs ({uuids.length})
          </label>
          {uuids.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied All" : "Copy All"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                <Download className="size-3.5" />
                Download
              </button>
            </div>
          )}
        </div>

        <div className="min-h-48 max-h-80 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs text-foreground space-y-2">
          {uuids.length > 0 ? (
            uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0"
              >
                <span>{uuid}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(uuid)}
                  className="text-[11px] text-muted-foreground hover:text-primary"
                >
                  Copy
                </button>
              </div>
            ))
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Hash className="size-8 opacity-40" />
              <span>Click "Generate UUIDs" to generate random unique identifiers.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const UuidGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "uuid-generator",
  slug: "uuid-generator",
  categoryId: "utilities",
  icon: Hash,
  component: UuidGeneratorTool,
  layoutDescription:
    "Generate cryptographically random UUID v4 (RFC 4122) or timestamp-based UUID v1 identifiers.",
};
