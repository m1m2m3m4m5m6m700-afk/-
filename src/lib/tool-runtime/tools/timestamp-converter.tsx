import { useMemo, useState } from "react";
import { Clock, Copy, Check, RotateCcw, Download } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

type Unit = "seconds" | "milliseconds";

const TIMEZONES = [
  "UTC",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Tehran",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Europe/Moscow",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Pacific/Auckland",
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatParts(
  d: Date,
  tz: string,
): {
  iso: string;
  local: string;
  rfc2822: string;
  relative: string;
} {
  const locale = "en-GB";
  const tzOpts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat(locale, tzOpts).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const y = get("year");
  const mo = get("month");
  const da = get("day");
  const h = get("hour") === "24" ? "00" : get("hour");
  const mi = get("minute");
  const s = get("second");
  const local = `${y}-${mo}-${da} ${pad(Number(h))}:${mi}:${s} ${tz}`;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Use UTC parts for the weekday to stay deterministic
  const rfc2822 = `${days[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} +0000`;

  const now = Date.now();
  const diff = d.getTime() - now;
  const absDiff = Math.abs(diff);
  const past = diff < 0;
  let relative: string;
  if (absDiff < 60_000)
    relative = `${Math.round(absDiff / 1000)} seconds ${past ? "ago" : "from now"}`;
  else if (absDiff < 3_600_000)
    relative = `${Math.round(absDiff / 60_000)} minutes ${past ? "ago" : "from now"}`;
  else if (absDiff < 86_400_000)
    relative = `${Math.round(absDiff / 3_600_000)} hours ${past ? "ago" : "from now"}`;
  else relative = `${Math.round(absDiff / 86_400_000)} days ${past ? "ago" : "from now"}`;

  return { iso: d.toISOString(), local, rfc2822, relative };
}

function CopyBtn({
  value,
  id,
  copied,
  onCopy,
}: {
  value: string;
  id: string;
  copied: string | null;
  onCopy: (value: string, id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value, id)}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
    >
      {copied === id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

function TimestampConverterTool() {
  const [tsInput, setTsInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [unit, setUnit] = useState<Unit>("seconds");
  const [tz, setTz] = useState("UTC");
  const [dateInput, setDateInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const tsResult = useMemo(() => {
    const trimmed = tsInput.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (Number.isNaN(numeric)) return { error: "Enter a valid numeric timestamp" };
    const ms = unit === "seconds" ? numeric * 1000 : numeric;
    if (!Number.isFinite(ms) || ms < -8_640_000_000_000_000 || ms > 8_640_000_000_000_000) {
      return { error: "Timestamp out of valid range" };
    }
    const d = new Date(ms);
    return { d, ...formatParts(d, tz) };
  }, [tsInput, unit, tz]);

  const dateResult = useMemo(() => {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return { error: "Unrecognized date format" };
    return {
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
      iso: d.toISOString(),
    };
  }, [dateInput]);

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = () => {
    if (!tsResult || "error" in tsResult) return;
    const lines = [
      `Timestamp: ${tsInput} (${unit})`,
      `ISO 8601: ${tsResult.iso}`,
      `Local (${tz}): ${tsResult.local}`,
      `RFC 2822: ${tsResult.rfc2822}`,
      `Relative: ${tsResult.relative}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timestamp-conversion.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const useNow = () => {
    setTsInput(String(Math.floor(Date.now() / (unit === "seconds" ? 1000 : 1))));
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      {/* Timestamp → Human */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Unix Timestamp → Human Date
          </label>
          <button
            type="button"
            onClick={useNow}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <Clock className="size-3.5" />
            Use now
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="e.g. 1699999999"
            inputMode="numeric"
            className="flex-1 min-w-[180px] rounded-2xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex rounded-xl border border-border p-1 bg-background">
            {(["seconds", "milliseconds"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  unit === u
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u === "seconds" ? "Seconds" : "Millis"}
              </button>
            ))}
          </div>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {TIMEZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        {tsResult && (
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
            {"error" in tsResult ? (
              <span className="text-sm font-semibold text-destructive">{tsResult.error}</span>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">ISO 8601 (UTC)</span>
                  <CopyBtn value={tsResult.iso} id="iso" copied={copied} onCopy={handleCopy} />
                </div>
                <p className="font-mono text-sm text-foreground break-all">{tsResult.iso}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Local time ({tz})</span>
                  <CopyBtn value={tsResult.local} id="local" copied={copied} onCopy={handleCopy} />
                </div>
                <p className="font-mono text-sm text-foreground break-all">{tsResult.local}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">RFC 2822</span>
                  <CopyBtn value={tsResult.rfc2822} id="rfc" copied={copied} onCopy={handleCopy} />
                </div>
                <p className="font-mono text-sm text-foreground break-all">{tsResult.rfc2822}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Relative</span>
                  <CopyBtn value={tsResult.relative} id="rel" copied={copied} onCopy={handleCopy} />
                </div>
                <p className="font-mono text-sm text-foreground">{tsResult.relative}</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Download className="size-3.5" />
                  Download all
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Human → Timestamp */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Human Date → Unix Timestamp
          </label>
          {dateInput && (
            <button
              type="button"
              onClick={() => {
                setTsInput("");
                setDateInput("");
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3" />
              Clear
            </button>
          )}
        </div>
        <input
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="e.g. 2026-01-15 or 2026-01-15T10:30:00Z"
          className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {dateResult && (
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
            {"error" in dateResult ? (
              <span className="text-sm font-semibold text-destructive">{dateResult.error}</span>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Seconds</span>
                  <CopyBtn
                    value={String(dateResult.seconds)}
                    id="secs"
                    copied={copied}
                    onCopy={handleCopy}
                  />
                </div>
                <p className="font-mono text-sm text-foreground break-all">{dateResult.seconds}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Milliseconds</span>
                  <CopyBtn
                    value={String(dateResult.milliseconds)}
                    id="ms"
                    copied={copied}
                    onCopy={handleCopy}
                  />
                </div>
                <p className="font-mono text-sm text-foreground break-all">
                  {dateResult.milliseconds}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">ISO 8601 (UTC)</span>
                  <CopyBtn value={dateResult.iso} id="diso" copied={copied} onCopy={handleCopy} />
                </div>
                <p className="font-mono text-sm text-foreground break-all">{dateResult.iso}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const TimestampConverterRuntime: ReadyToolRuntimeDefinition = {
  toolId: "timestamp-converter",
  slug: "timestamp-converter",
  categoryId: "converters",
  icon: Clock,
  component: TimestampConverterTool,
  layoutDescription:
    "Convert Unix timestamps (seconds or milliseconds) to human-readable dates across timezones, and dates back to timestamps.",
};
