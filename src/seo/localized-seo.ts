import type { LocaleCode } from '../config/i18n';
import { SUPPORTED_LANGUAGES } from '../config/i18n';
import { getLocale, localePath } from '../i18n';
import { TOOLS_REGISTRY } from '../config/tools';

const siteOrigin = (): string => {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};

const OG_LOCALES: Record<LocaleCode, string> = {
  en: 'en_US', zh: 'zh_CN', hi: 'hi_IN', es: 'es_ES', fr: 'fr_FR', ar: 'ar_SA', bn: 'bn_BD',
  pt: 'pt_PT', ru: 'ru_RU', ur: 'ur_PK', id: 'id_ID', de: 'de_DE', ja: 'ja_JP', sw: 'sw_KE',
  mr: 'mr_IN', te: 'te_IN', tr: 'tr_TR', ta: 'ta_IN', ko: 'ko_KR', vi: 'vi_VN',
};

export const absoluteLocaleUrl = (locale: LocaleCode, toolPath: string): string => {
  const path = localePath(locale, toolPath);
  const origin = siteOrigin();
  return origin ? `${origin}${path}` : path;
};

export const buildOgImageUrl = (locale: LocaleCode, toolId: string): string => {
  const origin = siteOrigin();
  const path = `/og/${locale}/${toolId}.svg`;
  return origin ? `${origin}${path}` : path;
};

export const getOgLocale = (locale: LocaleCode): string => OG_LOCALES[locale];

export const buildHreflangLinks = (toolPath: string) => [
  ...SUPPORTED_LANGUAGES.map((language) => ({ rel: 'alternate', hreflang: language.code, href: absoluteLocaleUrl(language.code, toolPath) })),
  { rel: 'alternate', hreflang: 'x-default', href: absoluteLocaleUrl('en', toolPath) },
];

export const buildWebApplicationJsonLd = (localeCode: LocaleCode, toolId: string) => {
  const locale = getLocale(localeCode);
  const tool = TOOLS_REGISTRY.find((item) => item.id === toolId);
  if (!tool) return null;
  const translated = locale.tools[toolId] ?? { title: tool.title, description: tool.description };
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `FLIXO — ${translated.title}`,
    url: absoluteLocaleUrl(localeCode, tool.path),
    inLanguage: localeCode,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript, HTML5, Canvas',
    description: translated.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
};

export const PRIVACY_MESSAGES: Record<LocaleCode, string> = {
  en: 'Private by design: supported image processing runs locally in your browser. Files are not uploaded by this page.',
  zh: '隐私优先：支持的图像处理在浏览器本地运行，本页面不会上传文件。',
  hi: 'गोपनीयता पहले: समर्थित इमेज प्रोसेसिंग आपके ब्राउज़र में स्थानीय रूप से चलती है। यह पेज फ़ाइलें अपलोड नहीं करता।',
  es: 'Privacidad por diseño: el procesamiento compatible se ejecuta localmente en tu navegador. Esta página no sube tus archivos.',
  fr: 'Confidentialité par conception : les traitements pris en charge s’exécutent localement dans votre navigateur. Cette page ne téléverse pas vos fichiers.',
  ar: 'الخصوصية أولاً: معالجة الصور المدعومة تتم محليًا داخل متصفحك، ولا ترفع هذه الصفحة ملفاتك.',
  bn: 'গোপনীয়তা অগ্রাধিকার: সমর্থিত ছবি প্রক্রিয়াকরণ আপনার ব্রাউজারেই স্থানীয়ভাবে চলে। এই পৃষ্ঠা ফাইল আপলোড করে না।',
  pt: 'Privacidade por padrão: o processamento compatível ocorre localmente no navegador. Esta página não envia seus arquivos.',
  ru: 'Конфиденциальность прежде всего: поддерживаемая обработка изображений выполняется локально в браузере. Эта страница не загружает файлы.',
  ur: 'رازداری پہلے: معاون تصویر پراسیسنگ آپ کے براؤزر میں مقامی طور پر ہوتی ہے۔ یہ صفحہ فائلیں اپ لوڈ نہیں کرتا۔',
  id: 'Privasi utama: pemrosesan gambar yang didukung berjalan secara lokal di browser. Halaman ini tidak mengunggah file Anda.',
  de: 'Datenschutz zuerst: Unterstützte Bildverarbeitung läuft lokal im Browser. Diese Seite lädt keine Dateien hoch.',
  ja: 'プライバシー優先: 対応する画像処理はブラウザ内でローカルに実行され、このページからファイルはアップロードされません。',
  sw: 'Faragha kwanza: uchakataji wa picha unaoungwa mkono hufanyika ndani ya kivinjari chako. Ukurasa huu haupakii faili.',
  mr: 'गोपनीयतेला प्राधान्य: समर्थित प्रतिमा प्रक्रिया तुमच्या ब्राउझरमध्ये स्थानिकरित्या चालते. हे पृष्ठ फाइल्स अपलोड करत नाही.',
  te: 'గోప్యత ముందుగా: మద్దతు ఉన్న చిత్ర ప్రాసెసింగ్ మీ బ్రౌజర్‌లోనే స్థానికంగా జరుగుతుంది. ఈ పేజీ ఫైళ్లను అప్‌లోడ్ చేయదు.',
  tr: 'Gizlilik önceliklidir: desteklenen görüntü işleme tarayıcınızda yerel olarak çalışır. Bu sayfa dosyalarınızı yüklemez.',
  ta: 'தனியுரிமை முதலில்: ஆதரிக்கப்படும் பட செயலாக்கம் உங்கள் உலாவியிலேயே இயங்குகிறது. இந்தப் பக்கம் கோப்புகளைப் பதிவேற்றாது.',
  ko: '개인정보 보호 우선: 지원되는 이미지 처리는 브라우저에서 로컬로 실행되며 이 페이지는 파일을 업로드하지 않습니다.',
  vi: 'Ưu tiên quyền riêng tư: xử lý hình ảnh được hỗ trợ chạy cục bộ trong trình duyệt. Trang này không tải tệp của bạn lên.',
};

export const getPrivacyMessage = (locale: LocaleCode): string => PRIVACY_MESSAGES[locale];

export const toJsonLdScript = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
