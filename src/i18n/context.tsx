import { createContext, useContext } from 'react';
import type { TranslationSchema } from './schema';

const TranslationContext = createContext<TranslationSchema | null>(null);

export function TranslationProvider({ locale, children }: { locale: TranslationSchema; children: React.ReactNode }) {
  return <TranslationContext.Provider value={locale}>{children}</TranslationContext.Provider>;
}

export function useTranslation(): TranslationSchema {
  const value = useContext(TranslationContext);
  if (!value) throw new Error('useTranslation must be used inside TranslationProvider.');
  return value;
}
