import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_METADATA,
  SITE_ORIGIN,
  X_DEFAULT_LOCALE,
  isLocale,
  normalizeLocale,
  type Locale,
} from './config';

export type TranslationBundle = Readonly<{
  locale: Locale;
  languageTag: string;
  direction: 'ltr' | 'rtl';
  siteName: string;
  homeTitle: string;
  homeDescription: string;
}>;

export const TRANSLATION_BUNDLES: Record<Locale, TranslationBundle> = {
  en: { locale: 'en', languageTag: 'en', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Free online tools', homeDescription: 'Fast browser-based tools for images and everyday tasks.' },
  ar: { locale: 'ar', languageTag: 'ar', direction: 'rtl', siteName: 'فليكسو', homeTitle: 'أدوات مجانية عبر الإنترنت', homeDescription: 'أدوات سريعة تعمل في المتصفح للصور والمهام اليومية.' },
  es: { locale: 'es', languageTag: 'es', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Herramientas online gratuitas', homeDescription: 'Herramientas rápidas en el navegador para imágenes y tareas diarias.' },
  fr: { locale: 'fr', languageTag: 'fr', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Outils en ligne gratuits', homeDescription: 'Des outils rapides dans le navigateur pour les images et les tâches quotidiennes.' },
  de: { locale: 'de', languageTag: 'de', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Kostenlose Online-Tools', homeDescription: 'Schnelle Browser-Tools für Bilder und alltägliche Aufgaben.' },
  ru: { locale: 'ru', languageTag: 'ru', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Бесплатные онлайн-инструменты', homeDescription: 'Быстрые браузерные инструменты для изображений и повседневных задач.' },
  zh: { locale: 'zh', languageTag: 'zh-CN', direction: 'ltr', siteName: 'FLIXO', homeTitle: '免费在线工具', homeDescription: '适用于图片和日常任务的快速浏览器工具。' },
  hi: { locale: 'hi', languageTag: 'hi', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'मुफ़्त ऑनलाइन टूल', homeDescription: 'इमेज और रोज़मर्रा के कामों के लिए तेज़ ब्राउज़र टूल।' },
  id: { locale: 'id', languageTag: 'id', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Alat online gratis', homeDescription: 'Alat cepat berbasis browser untuk gambar dan tugas sehari-hari.' },
  ur: { locale: 'ur', languageTag: 'ur', direction: 'rtl', siteName: 'FLIXO', homeTitle: 'مفت آن لائن ٹولز', homeDescription: 'تصاویر اور روزمرہ کاموں کے لیے تیز براؤزر ٹولز۔' },
  ja: { locale: 'ja', languageTag: 'ja', direction: 'ltr', siteName: 'FLIXO', homeTitle: '無料のオンラインツール', homeDescription: '画像や日常の作業に使える高速ブラウザーツール。' },
  pt: { locale: 'pt', languageTag: 'pt', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Ferramentas online gratuitas', homeDescription: 'Ferramentas rápidas no navegador para imagens e tarefas do dia a dia.' },
  it: { locale: 'it', languageTag: 'it', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Strumenti online gratuiti', homeDescription: 'Strumenti rapidi nel browser per immagini e attività quotidiane.' },
  ko: { locale: 'ko', languageTag: 'ko', direction: 'ltr', siteName: 'FLIXO', homeTitle: '무료 온라인 도구', homeDescription: '이미지와 일상 작업을 위한 빠른 브라우저 도구입니다.' },
  nl: { locale: 'nl', languageTag: 'nl', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Gratis online tools', homeDescription: 'Snelle browsertools voor afbeeldingen en dagelijkse taken.' },
  pl: { locale: 'pl', languageTag: 'pl', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Darmowe narzędzia online', homeDescription: 'Szybkie narzędzia w przeglądarce do obrazów i codziennych zadań.' },
  tr: { locale: 'tr', languageTag: 'tr', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Ücretsiz çevrimiçi araçlar', homeDescription: 'Görseller ve günlük işler için hızlı tarayıcı araçları.' },
  vi: { locale: 'vi', languageTag: 'vi', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Công cụ trực tuyến miễn phí', homeDescription: 'Công cụ trình duyệt nhanh cho hình ảnh và công việc hằng ngày.' },
  th: { locale: 'th', languageTag: 'th', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'เครื่องมือออนไลน์ฟรี', homeDescription: 'เครื่องมือบนเบราว์เซอร์ที่รวดเร็วสำหรับรูปภาพและงานประจำวัน' },
  sv: { locale: 'sv', languageTag: 'sv', direction: 'ltr', siteName: 'FLIXO', homeTitle: 'Gratis onlineverktyg', homeDescription: 'Snabba webbläsarverktyg för bilder och vardagliga uppgifter.' },
};

export { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, SITE_ORIGIN, X_DEFAULT_LOCALE, isLocale, normalizeLocale };
export type { Locale };
