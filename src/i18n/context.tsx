import { createContext, useContext } from 'react';
import TOOL_UI from './tool-ui';
import type { ToolUiText, TranslationSchema } from './schema';

const TranslationContext = createContext<TranslationSchema | null>(null);

export function TranslationProvider({ locale, children }: { locale: TranslationSchema; children: React.ReactNode }) {
  const commonToolUi: ToolUiText = locale.commonToolUi ?? TOOL_UI[locale.code] as ToolUiText;
  const completeLocale: TranslationSchema = { ...locale, commonToolUi };
  return <TranslationContext.Provider value={completeLocale}>{children}</TranslationContext.Provider>;
}

export function useTranslation(): TranslationSchema {
  const value = useContext(TranslationContext);
  if (!value) throw new Error('useTranslation must be used inside TranslationProvider.');
  return value;
}
