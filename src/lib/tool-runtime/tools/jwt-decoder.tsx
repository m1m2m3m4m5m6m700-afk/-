import { useState } from "react";
import { Shield, Copy, Check, AlertCircle, Clock } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function parseJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error(
      "Invalid JWT format. A valid JWT must contain 3 dot-separated parts (header.payload.signature).",
    );
  }

  const decodePart = (part: string) => {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  };

  return {
    header: decodePart(parts[0]),
    payload: decodePart(parts[1]),
    signature: parts[2],
  };
}

function JwtDecoderTool() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MDAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  );
  const [copied, setCopied] = useState(false);

  let decoded: {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
  } | null = null;
  let error: string | null = null;

  if (token.trim()) {
    try {
      decoded = parseJwt(token);
    } catch (err) {
      error = (err as Error).message || "Failed to decode JWT";
    }
  }

  const expNum = typeof decoded?.payload?.exp === "number" ? decoded.payload.exp : null;
  const iatNum = typeof decoded?.payload?.iat === "number" ? decoded.payload.iat : null;
  const isExpired = expNum ? expNum * 1000 < Date.now() : null;
  const expDate = expNum ? new Date(expNum * 1000).toLocaleString() : null;
  const iatDate = iatNum ? new Date(iatNum * 1000).toLocaleString() : null;

  const handleCopyPayload = () => {
    if (!decoded) return;
    navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Paste JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1Ni..."
          className="w-full h-32 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none break-all"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-500 text-xs font-semibold">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : decoded ? (
        <div className="space-y-6">
          {expDate && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
                isExpired
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              }`}
            >
              <Clock className="size-5 shrink-0" />
              <div>
                <span>{isExpired ? "Token Expired on: " : "Token Active — Expires on: "}</span>
                <span className="font-mono">{expDate}</span>
                {iatDate && (
                  <span className="block text-[11px] opacity-80 mt-0.5">Issued at: {iatDate}</span>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider text-rose-500">
                Header (Algorithm & Token Type)
              </label>
              <pre className="h-48 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground overflow-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider text-purple-500">
                  Payload (Claims & Data)
                </label>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy Payload"}
                </button>
              </div>
              <pre className="h-48 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground overflow-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-border rounded-2xl bg-background">
          <Shield className="size-8 opacity-40" />
          <span className="text-xs">Paste a JWT token above to inspect claims.</span>
        </div>
      )}
    </div>
  );
}

export const JwtDecoderRuntime: ReadyToolRuntimeDefinition = {
  toolId: "jwt-decoder",
  slug: "jwt-decoder",
  categoryId: "developer",
  icon: Shield,
  component: JwtDecoderTool,
  layoutDescription:
    "Decode and inspect JSON Web Token (JWT) headers, payloads, claims, and expiration timestamps.",
};
