import type { ToolConfig } from '../config/tools';

export type SupportedLanguage =
  | 'en' | 'ar' | 'zh' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'ko' | 'ru'
  | 'it' | 'nl' | 'pl' | 'tr' | 'sv' | 'id' | 'hi' | 'ur' | 'vi' | 'th';

export type TranslationSchema = {
  readonly code: SupportedLanguage;
  readonly dir: 'ltr' | 'rtl';
  readonly common: {
    readonly processing: string;
    readonly download: string;
    readonly clear: string;
    readonly upload: string;
    readonly privacy: string;
    readonly notFoundTitle: string;
    readonly notFoundDescription: string;
  };
  readonly commonToolUi: {
    readonly prompt: string;
    readonly promptPlaceholder: string;
    readonly chooseImage: string;
    readonly imageInput: string;
    readonly outputFormat: string;
    readonly scale: string;
    readonly backgroundTolerance: string;
    readonly svgColumns: string;
    readonly x: string;
    readonly y: string;
    readonly width: string;
    readonly height: string;
    readonly outputWidth: string;
    readonly outputHeight: string;
    readonly runTool: string;
    readonly generateImage: string;
    readonly downloadNow: string;
    readonly noResult: string;
    readonly outputDetails: string;
    readonly ocrPrivacy: string;
    readonly generatorPrivacy: string;
  };
  readonly glossary: {
    readonly clientSideProcessing: string;
  };
  readonly tools: {
    readonly [K in ToolConfig['id']]: {
      readonly title: string;
      readonly description: string;
    };
  };
};
