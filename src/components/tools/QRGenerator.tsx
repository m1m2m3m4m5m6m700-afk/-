import { Download, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const modes = ["URL", "Text", "Wi-Fi", "Email", "Phone"] as const;
type Mode = (typeof modes)[number];

export function QRGenerator() {
  const [mode, setMode] = useState<Mode>("URL");
  const [value, setValue] = useState("https://flixo.ai");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [color, setColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  const payload = useMemo(() => {
    if (mode === "Wi-Fi") return `WIFI:T:${security};S:${ssid};P:${password};;`;
    if (mode === "Email") return `mailto:${value}`;
    if (mode === "Phone") return `tel:${value}`;
    return value;
  }, [mode, value, ssid, password, security]);

  useEffect(() => {
    let cancelled = false;
    setError("");
    if (!payload.trim()) {
      setDataUrl("");
      return;
    }
    QRCode.toDataURL(payload, {
      width: 720,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: color, light: background },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl("");
          setError("Unable to generate this QR code. Check the entered value.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [payload, color, background]);

  const reset = () => {
    setMode("URL");
    setValue("https://flixo.ai");
    setSsid("");
    setPassword("");
    setSecurity("WPA");
    setColor("#000000");
    setBackground("#ffffff");
    setError("");
  };

  const downloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `flixo-qr-${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.click();
  };

  const downloadSvg = async () => {
    if (!payload.trim()) return;
    try {
      const svg = await QRCode.toString(payload, {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: color, light: background },
      });
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flixo-qr-${mode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Unable to export the SVG file.");
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <QrCode className="size-4" />
              QR content
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {modes.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={mode === item ? "default" : "outline"}
                  onClick={() => setMode(item)}
                  className="rounded-xl"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {mode === "Wi-Fi" ? (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="qr-ssid">Network name (SSID)</Label><Input id="qr-ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="My Wi-Fi" /></div>
              <div className="space-y-2"><Label htmlFor="qr-password">Password</Label><Input id="qr-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="space-y-2"><Label htmlFor="qr-security">Security</Label><select id="qr-security" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" value={security} onChange={(e) => setSecurity(e.target.value as typeof security)}><option value="WPA">WPA / WPA2</option><option value="WEP">WEP</option><option value="nopass">Open network</option></select></div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="qr-value">{mode === "URL" ? "Website URL" : mode === "Email" ? "Email address" : mode === "Phone" ? "Phone number" : "Text"}</Label>
              <Input id="qr-value" value={value} onChange={(e) => setValue(e.target.value)} placeholder={mode === "URL" ? "https://example.com" : "Enter content"} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
              <Label htmlFor="qr-dark">Foreground</Label>
              <Input id="qr-dark" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer p-1" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
              <Label htmlFor="qr-light">Background</Label>
              <Input id="qr-light" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-14 cursor-pointer p-1" />
            </div>
          </div>

          {error ? <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={downloadPng} disabled={!dataUrl} className="rounded-xl"><Download className="me-2 size-4" />Download PNG</Button>
            <Button type="button" variant="outline" onClick={downloadSvg} disabled={!payload.trim()} className="rounded-xl">Download SVG</Button>
            <Button type="button" variant="ghost" onClick={reset} className="rounded-xl"><RefreshCw className="me-2 size-4" />Reset</Button>
          </div>
        </div>

        <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-border bg-background p-6">
          {dataUrl ? <img src={dataUrl} alt="Generated QR code preview" className="h-auto w-full max-w-[340px] rounded-xl" /> : <div className="text-center text-sm text-muted-foreground">Enter content to generate your QR code.</div>}
        </div>
      </div>
    </div>
  );
}
