import en from './locales/en';
import ar from './locales/ar';
import zh from './locales/zh';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import ja from './locales/ja';
import ko from './locales/ko';
import ru from './locales/ru';
import it from './locales/it';
import nl from './locales/nl';
import pl from './locales/pl';
import tr from './locales/tr';
import sv from './locales/sv';
import id from './locales/id';
import hi from './locales/hi';
import ur from './locales/ur';
import vi from './locales/vi';
import th from './locales/th';
import type { SupportedLanguage, TranslationSchema } from './schema';

export const LOCALES = {
  en, ar, zh, es, fr, de, pt, ja, ko, ru, it, nl, pl, tr, sv, id, hi, ur, vi, th,
} as const satisfies Record<SupportedLanguage, TranslationSchema>;

export function getLocale(language: SupportedLanguage): TranslationSchema {
  return LOCALES[language];
}
