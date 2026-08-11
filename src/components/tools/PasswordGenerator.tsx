import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Sliders,
  Sparkles,
  Lock,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trackCopyAction } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "il1Lo0OI";

export function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const generatePassword = useCallback(() => {
    let charset = "";
    if (useUpper) charset += UPPERCASE;
    if (useLower) charset += LOWERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;

    if (excludeAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !AMBIGUOUS.includes(char))
        .join("");
    }

    if (!charset) {
      setPassword("");
      return;
    }

    let result = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }

    setPassword(result);
    setCopied(false);
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Entropy & strength score calculation
  const calculateStrength = () => {
    if (!password) return { label: "" as const, score: 0, color: "bg-muted" };

    let poolSize = 0;
    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 26;

    const entropy = length * Math.log2(poolSize || 1);

    if (entropy < 28)
      return {
        label: "passwordGen.strength.weak",
        score: 1,
        color: "bg-destructive",
        text: "text-destructive",
      };
    if (entropy < 45)
      return {
        label: "passwordGen.strength.fair",
        score: 2,
        color: "bg-amber-500",
        text: "text-amber-500",
      };
    if (entropy < 65)
      return {
        label: "passwordGen.strength.good",
        score: 3,
        color: "bg-blue-500",
        text: "text-blue-500",
      };
    if (entropy < 90)
      return {
        label: "passwordGen.strength.strong",
        score: 4,
        color: "bg-emerald-500",
        text: "text-emerald-500",
      };
    return {
      label: "passwordGen.strength.veryStrong",
      score: 5,
      color: "bg-emerald-600",
      text: "text-emerald-600",
    };
  };

  const strength = calculateStrength();

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      trackCopyAction("password", password.length, "password-generator");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur md:p-6">
      {/* Password Display Box */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-background/80 p-4 shadow-inner">
        <div className="min-w-0 flex-1 overflow-x-auto py-1">
          <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground select-all break-all">
            {password || (
              <span className="text-muted-foreground italic text-base">
                {t("passwordGen.empty")}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={generatePassword}
            title={t("passwordGen.regenerate")}
            className="rounded-xl"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button onClick={handleCopy} disabled={!password} className="rounded-xl shadow-xs">
            {copied ? <Check className="me-1.5 size-4" /> : <Copy className="me-1.5 size-4" />}
            {copied ? t("passwordGen.copied") : t("passwordGen.copy")}
          </Button>
        </div>
      </div>

      {/* Strength Meter Bar */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-surface/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {strength.score >= 4 ? (
            <ShieldCheck className="size-4 text-emerald-500" />
          ) : strength.score >= 2 ? (
            <Shield className="size-4 text-amber-500" />
          ) : (
            <ShieldAlert className="size-4 text-destructive" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("passwordGen.strength")}{" "}
            <span className={cn("normal-case font-bold ms-1", strength.text)}>
              {strength.label ? t(strength.label as never) : ""}
            </span>
          </span>
        </div>

        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "h-2 w-6 rounded-full transition-colors duration-300",
                level <= strength.score ? strength.color : "bg-muted/80",
              )}
            />
          ))}
        </div>
      </div>

      {/* Customization Options */}
      <div className="mt-6 space-y-6">
        {/* Length Slider */}
        <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-foreground">{t("passwordGen.length")}</span>
            <span className="font-mono text-base font-bold text-primary">
              {t("passwordGen.lengthChars", { count: length })}
            </span>
          </div>
          <Slider
            value={[length]}
            min={6}
            max={64}
            step={1}
            onValueChange={(val) => setLength(val[0])}
          />
        </div>

        {/* Toggles Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
            <div>
              <Label className="text-xs font-semibold">{t("passwordGen.uppercase")}</Label>
              <p className="text-[11px] text-muted-foreground">{t("passwordGen.uppercaseHint")}</p>
            </div>
            <Switch checked={useUpper} onCheckedChange={setUseUpper} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
            <div>
              <Label className="text-xs font-semibold">{t("passwordGen.lowercase")}</Label>
              <p className="text-[11px] text-muted-foreground">{t("passwordGen.lowercaseHint")}</p>
            </div>
            <Switch checked={useLower} onCheckedChange={setUseLower} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
            <div>
              <Label className="text-xs font-semibold">{t("passwordGen.numbers")}</Label>
              <p className="text-[11px] text-muted-foreground">{t("passwordGen.numbersHint")}</p>
            </div>
            <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
            <div>
              <Label className="text-xs font-semibold">{t("passwordGen.symbols")}</Label>
              <p className="text-[11px] text-muted-foreground">{t("passwordGen.symbolsHint")}</p>
            </div>
            <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
          </div>
        </div>

        {/* Exclude Ambiguous Option */}
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/40 p-4">
          <div>
            <Label className="text-xs font-semibold">{t("passwordGen.excludeAmbiguous")}</Label>
            <p className="text-[11px] text-muted-foreground">
              {t("passwordGen.excludeAmbiguousHint")}
            </p>
          </div>
          <Switch checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
        </div>
      </div>
    </div>
  );
}
