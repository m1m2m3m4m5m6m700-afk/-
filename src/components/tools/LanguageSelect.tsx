import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { AUTO_DETECT, LANGUAGES } from "@/lib/tools/translate";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  includeAuto?: boolean;
}

export function LanguageSelect({ value, onChange, label, includeAuto }: LanguageSelectProps) {
  const { t } = useI18n();

  return (
    <div className="min-w-0 flex-1">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full rounded-xl bg-card" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {includeAuto && <SelectItem value={AUTO_DETECT}>{t("translator.auto")}</SelectItem>}
          {LANGUAGES.map((l) => (
            <SelectItem key={l.code} value={l.code}>
              <span className="inline-flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.name}</span>
                <span className="text-muted-foreground text-xs">({l.nativeName})</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
