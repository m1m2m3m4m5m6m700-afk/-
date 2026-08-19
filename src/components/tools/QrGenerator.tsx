import {
  QrCode,
  Download,
  Copy,
  Check,
  Trash2,
  Link2,
  Wifi,
  Mail,
  Type,
  Phone,
  Sliders,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo/site";

type PresetMode = "url" | "text" | "wifi" | "email" | "phone";

const escapeWifiValue = (value: string): string => value.replace(/[\\;,:\"]/g, (character) => `\\${character}`);

export function QrGenerator() {
  const { t } = useI18n();
  const [mode, setMode] = useState<PresetMode>("url");
  const [input, setInput] = useState(SITE_URL);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [size, setSize] = useState<number>(300);
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPayload = (): string => {
    switch (mode) {
      case "wifi": return `WIFI:T:${wifiEncryption};S:${escapeWifiValue(wifiSsid)};P:${escapeWifiValue(wifiPass)};;`;
      case "email": return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case "phone": return `tel:${phoneNumber}`;
      default: return input;
    }
  };

  const payload = getPayload();

  useEffect(() => {
    if (!payload.trim()) {
      setQrDataUrl("");
      setQrSvgString("");
      return;
    }
    setError(null);
    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
      errorCorrectionLevel: ecLevel,
    }).then(setQrDataUrl).catch((err) => {
      console.error(err);
      setError(t("qr.error.invalid"));
    });
    QRCode.toString(payload, {
      type: "svg",
      width: size,
      margin: 2,
      color: { dark: darkColor, light: lightColor },
      errorCorrectionLevel: ecLevel,
    }).then(setQrSvgString).catch(() => {});
  }, [payload, size, darkColor, lightColor, ecLevel, t]);

  const handleCopyText = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError(t("qr.error.copy"));
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput(""); setWifiSsid(""); setWifiPass(""); setEmailTo(""); setEmailSubject(""); setPhoneNumber(""); setError(null);
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
        {[
          { id: "url", label: t("qr.mode.url"), icon: Link2 },
          { id: "text", label: t("qr.mode.text"), icon: Type },
          { id: "wifi", label: t("qr.mode.wifi"), icon: Wifi },
          { id: "email", label: t("qr.mode.email"), icon: Mail },
          { id: "phone", label: t("qr.mode.phone"), icon: Phone },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          return (
            <button key={item.id} type="button" aria-pressed={isActive} aria-label={t("qr.switchMode", { mode: item.label })} onClick={() => { setMode(item.id as PresetMode); setError(null); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${isActive ? "bg-primary text-primary-foreground shadow-xs" : "bg-surface text-muted-foreground hover:bg-card hover:text-foreground"}`}>
              <Icon className="size-3.5" />{item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {mode === "url" && <div><Label className="text-xs font-semibold">{t("qr.url.label")}</Label><Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("qr.url.placeholder")} className="mt-1.5 text-sm rounded-xl" /></div>}
          {mode === "text" && <div><Label className="text-xs font-semibold">{t("qr.text.label")}</Label><textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("qr.text.placeholder")} className="mt-1.5 min-h-32 w-full rounded-xl border border-input bg-background/60 p-3 text-sm outline-none placeholder:text-muted-foreground" /></div>}
          {mode === "wifi" && <div className="space-y-4"><div><Label className="text-xs font-semibold">{t("qr.wifi.ssid")}</Label><Input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} placeholder={t("qr.wifi.ssidPlaceholder")} className="mt-1.5 text-sm rounded-xl" /></div><div><Label className="text-xs font-semibold">{t("qr.wifi.password")}</Label><Input type="password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder={t("qr.wifi.passwordPlaceholder")} className="mt-1.5 text-sm rounded-xl" /></div><div><Label className="text-xs font-semibold">{t("qr.wifi.encryption")}</Label><select value={wifiEncryption} onChange={(e) => setWifiEncryption(e.target.value as "WPA" | "WEP" | "nopass")} className="mt-1.5 w-full rounded-xl border border-input bg-background/60 p-2 text-sm"><option value="WPA">{t("qr.wifi.wpa")}</option><option value="WEP">{t("qr.wifi.wep")}</option><option value="nopass">{t("qr.wifi.open")}</option></select></div></div>}
          {mode === "email" && <div className="space-y-4"><div><Label className="text-xs font-semibold">{t("qr.email.to")}</Label><Input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder={t("qr.email.toPlaceholder")} className="mt-1.5 text-sm rounded-xl" /></div><div><Label className="text-xs font-semibold">{t("qr.email.subject")}</Label><Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder={t("qr.email.subjectPlaceholder")} className="mt-1.5 text-sm rounded-xl" /></div></div>}
          {mode === "phone" && <div><Label className="text-xs font-semibold">{t("qr.phone.label")}</Label><Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t("qr.phone.placeholder")} className="mt-1.5 text-sm rounded-xl" /></div>}
          <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 space-y-3"><span className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5"><Sliders className="size-3.5 text-primary" />{t("qr.customization")}</span><div className="grid grid-cols-2 gap-3 pt-1"><div><Label className="text-[11px] text-muted-foreground">{t("qr.fgColor")}</Label><div className="flex items-center gap-2 mt-1"><input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="size-7 rounded cursor-pointer border-0 bg-transparent" /><span className="font-mono text-xs text-foreground">{darkColor}</span></div></div><div><Label className="text-[11px] text-muted-foreground">{t("qr.bgColor")}</Label><div className="flex items-center gap-2 mt-1"><input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="size-7 rounded cursor-pointer border-0 bg-transparent" /><span className="font-mono text-xs text-foreground">{lightColor}</span></div></div></div></div>
          <div className="flex items-center justify-between pt-2"><Button variant="ghost" size="sm" onClick={handleClear} className="rounded-xl text-xs text-muted-foreground"><Trash2 className="me-1.5 size-3.5" />{t("qr.clear")}</Button><Button variant="outline" size="sm" onClick={handleCopyText} disabled={!payload} className="rounded-xl text-xs">{copied ? <Check className="me-1.5 size-3.5 text-primary" /> : <Copy className="me-1.5 size-3.5" />}{copied ? t("qr.copiedContent") : t("qr.copyPayload")}</Button></div>
        </div>
        <div className="flex flex-col items-center justify-between rounded-2xl border border-border/70 bg-surface/60 p-6 text-center"><div className="w-full"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("qr.preview")}</span><div className="my-6 grid min-h-64 place-items-center rounded-2xl border border-border bg-white p-4 shadow-sm">{qrDataUrl ? <img src={qrDataUrl} alt={t("qr.previewAlt")} className="max-h-56 object-contain animate-rise" /> : <div className="flex flex-col items-center justify-center text-muted-foreground"><QrCode className="size-10 text-muted-foreground/40 mb-2" /><p className="text-xs">{t("qr.previewEmpty")}</p></div>}</div></div><div className="w-full space-y-2 pt-2"><Button onClick={handleDownloadPng} disabled={!qrDataUrl} className="w-full rounded-xl text-xs shadow-xs"><Download className="me-1.5 size-3.5" />Download PNG</Button><Button variant="outline" onClick={handleDownloadSvg} disabled={!qrSvgString} className="w-full rounded-xl text-xs"><Download className="me-1.5 size-3.5" />Download Vector SVG</Button></div></div>
      </div>
    </div>
  );
}
