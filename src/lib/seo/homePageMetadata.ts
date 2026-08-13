/**
 * Localized homepage SEO metadata. Builds the `head()` object for the
 * `/$locale` route: a native title + description + og:locale, self-canonical,
 * and reciprocal hreflang for every supported locale + x-default.
 *
 * Title/description are localized per locale where a native entry exists;
 * otherwise the English homepage copy is reused (never a raw key, never a
 * 404). Brand "Flixo" is preserved in every locale.
 */
import type { LocaleCode } from "@/lib/i18n";
import { SITE_NAME, getHomeUrl, getOgLocale } from "./site";
import { buildHomeHreflang } from "./hreflang";

interface HomeCopy {
  title: string;
  description: string;
  ogTitle: string;
}

const HOME_COPY: Partial<Record<LocaleCode, HomeCopy>> = {
  ar: {
    title: "فليكسو — منصة واحدة لجميع أدوات الذكاء الاصطناعي والمستندات",
    description:
      "فليكسو يقدم أدوات مجانية وسريعة للترجمة وتعديل الصور وملفات PDF وتحسين الكتابة مباشرة عبر المتصفح بدون تسجيل.",
    ogTitle: "فليكسو — أدوات الذكاء الاصطناعي",
  },
  es: {
    title: "Flixo — Un espacio de trabajo para cada herramienta de IA",
    description:
      "Flixo ofrece herramientas online gratuitas y rápidas para traducir, editar imágenes y PDF, y mejorar la escritura directamente en el navegador, sin registro.",
    ogTitle: "Flixo — Herramientas de IA online",
  },
  fr: {
    title: "Flixo — Un espace pour tous les outils IA",
    description:
      "Flixo propose des outils en ligne gratuits et rapides pour traduire, modifier des images et des PDF, et améliorer l'écriture directement dans le navigateur, sans inscription.",
    ogTitle: "Flixo — Outils IA en ligne",
  },
  de: {
    title: "Flixo — Ein Workspace für jedes KI-Tool",
    description:
      "Flixo bietet kostenlose, schnelle Online-Tools zum Übersetzen, Bearbeiten von Bildern und PDFs und Verbessern von Texten direkt im Browser, ohne Registrierung.",
    ogTitle: "Flixo — KI-Tools online",
  },
  pt: {
    title: "Flixo — Um espaço para cada ferramenta de IA",
    description:
      "A Flixo oferece ferramentas online gratuitas e rápidas para traduzir, editar imagens e PDFs e melhorar a escrita diretamente no navegador, sem registro.",
    ogTitle: "Flixo — Ferramentas de IA online",
  },
  it: {
    title: "Flixo — Uno spazio per ogni strumento IA",
    description:
      "Flixo offre strumenti online gratuiti e veloci per tradurre, modificare immagini e PDF e migliorare la scrittura direttamente nel browser, senza registrazione.",
    ogTitle: "Flixo — Strumenti IA online",
  },
  nl: {
    title: "Flixo — Één werkruimte voor elke AI-tool",
    description:
      "Flixo biedt gratis en snelle online tools voor vertalen, het bewerken van afbeeldingen en PDF's en het verbeteren van teksten direct in je browser, zonder registratie.",
    ogTitle: "Flixo — Online AI-tools",
  },
  pl: {
    title: "Flixo — Jedna przestrzeń do każdego narzędzia AI",
    description:
      "Flixo oferuje darmowe i szybkie narzędzia online do tłumaczenia, edycji obrazów i plików PDF oraz poprawy pisania bezpośrednio w przeglądarce, bez rejestracji.",
    ogTitle: "Flixo — Narzędzia AI online",
  },
  sv: {
    title: "Flixo — En arbetsyta för varje AI-verktyg",
    description:
      "Flixo erbjuder gratis och snabba onlineverktyg för översättning, bild- och PDF-redigering och textförbättring direkt i webbläsaren, utan registrering.",
    ogTitle: "Flixo — AI-verktyg online",
  },
  tr: {
    title: "Flixo — Her yapay zeka aracı için tek çalışma alanı",
    description:
      "Flixo; çeviri, görsel ve PDF düzenleme ile yazım iyileştirme için kayıt olmadan doğrudan tarayıcıda çalışan ücretsiz ve hızlı çevrimiçi araçlar sunar.",
    ogTitle: "Flixo — Çevrimiçi yapay zeka araçları",
  },
  ro: {
    title: "Flixo — Un spațiu pentru fiecare instrument AI",
    description:
      "Flixo oferă instrumente online gratuite și rapide pentru traducere, editarea imaginilor și a PDF-urilor și îmbunătățirea scrierii direct în browser, fără înregistrare.",
    ogTitle: "Flixo — Instrumente AI online",
  },
  uk: {
    title: "Flixo — Один простір для кожного ШІ-інструмента",
    description:
      "Flixo пропонує безкоштовні та швидкі онлайн-інструменти для перекладу, редагування зображень і PDF і покращення письма безпосередньо у браузері, без реєстрації.",
    ogTitle: "Flixo — ШІ-інструменти онлайн",
  },
  ru: {
    title: "Flixo — Одно пространство для каждого ИИ-инструмента",
    description:
      "Flixo предлагает бесплатные и быстрые онлайн-инструменты для перевода, редактирования изображений и PDF и улучшения текста прямо в браузере, без регистрации.",
    ogTitle: "Flixo — ИИ-инструменты онлайн",
  },
  id: {
    title: "Flixo — Satu ruang kerja untuk setiap alat AI",
    description:
      "Flixo menyediakan alat online gratis dan cepat untuk menerjemahkan, mengedit gambar dan PDF, serta menyempurnakan tulisan langsung di browser, tanpa pendaftaran.",
    ogTitle: "Flixo — Alat AI online",
  },
  ms: {
    title: "Flixo — Satu ruang kerja untuk setiap alat AI",
    description:
      "Flixo menyediakan alat dalam talian percuma dan pantas untuk menterjemah, mengedit imej dan PDF serta mempertingkat tulisan terus dalam pelayar, tanpa pendaftaran.",
    ogTitle: "Flixo — Alat AI dalam talian",
  },
  vi: {
    title: "Flixo — Một không gian cho mọi công cụ AI",
    description:
      "Flixo cung cấp công cụ trực tuyến miễn phí và nhanh chóng để dịch, chỉnh sửa hình ảnh và PDF, cùng cải thiện văn bản ngay trong trình duyệt, không cần đăng ký.",
    ogTitle: "Flixo — Công cụ AI trực tuyến",
  },
  "zh-CN": {
    title: "Flixo — 每种 AI 工具的一站式工作区",
    description:
      "Flixo 提供免费、快速的在线工具，用于翻译、编辑图片和 PDF 以及改善文本，直接在浏览器中使用，无需注册。",
    ogTitle: "Flixo — 在线 AI 工具",
  },
  ja: {
    title: "Flixo — あらゆる AI ツールのためのひとつのワークスペース",
    description:
      "Flixoは翻訳、画像やPDFの編集、文章の改善のための無料・高速なオンラインツールを、登録不要でブラウザ内で直接ご提供します。",
    ogTitle: "Flixo — オンライン AI ツール",
  },
  ko: {
    title: "Flixo — 모든 AI 도구를 위한 하나의 워크스페이스",
    description:
      "Flixo는 번역, 이미지·PDF 편집, 글쓰기 개선을 위한 무료·빠른 온라인 도구를 가입 없이 브라우저에서 직접 제공합니다.",
    ogTitle: "Flixo — 온라인 AI 도구",
  },
  el: {
    title: "Flixo — Ένας χώρος για κάθε εργαλείο ΤΝ",
    description:
      "Το Flixo προσφέρει δωρεάν και γρήγορα διαδικτυακά εργαλεία για μετάφραση, επεξεργασία εικόνων και PDF και βελτίωση κειμένου απευθείας στον browser, χωρίς εγγραφή.",
    ogTitle: "Flixo — Διαδικτυακά εργαλεία ΤΝ",
  },
  cs: {
    title: "Flixo — Jeden prostor pro každý AI nástroj",
    description:
      "Flixo nabízí bezplatné a rychlé online nástroje pro překlad, úpravu obrázků a PDF a vylepšení textu přímo v prohlížeči, bez registrace.",
    ogTitle: "Flixo — Online AI nástroje",
  },
  th: {
    title: "Flixo — พื้นที่ทำงานเดียวสำหรับทุกเครื่องมือ AI",
    description:
      "Flixo นำเสนอเครื่องมือออนไลน์ฟรีและรวดเร็วสำหรับการแปล แก้ไขรูปภาพและ PDF และปรับปรุงข้อความ โดยตรงในเบราว์เซอร์ โดยไม่ต้องสมัคร",
    ogTitle: "Flixo — เครื่องมือ AI ออนไลน์",
  },
  hi: {
    title: "Flixo — हर AI टूल के लिए एक कार्यस्थल",
    description:
      "Flixo अनुवाद, छवि और PDF संपादन और लेखन सुधार के लिए मुफ़्त और तेज़ ऑनलाइन टूल बिना रजिस्टर किए सीधे ब्राउज़र में प्रदान करता है।",
    ogTitle: "Flixo — ऑनलाइन AI टूल्स",
  },
  he: {
    title: "Flixo — מרחב עבודה אחד לכל כלי AI",
    description:
      "Flixo מציע כלים אונליין חינמיים ומהירים לתרגום, עריכת תמונות ו-PDF ושיפור כתיבה ישירות בדפדפן, ללא הרשמה.",
    ogTitle: "Flixo — כלי AI אונליין",
  },
  fa: {
    title: "Flixo — یک فضای کاری برای هر ابزار هوش مصنوعی",
    description:
      "Flixo ابزارهای آنلاین رایگان و سریع را برای ترجمه، ویرایش تصاویر و PDF و بهبود نوشتار مستقیماً در مرورگر، بدون ثبت‌نام ارائه می‌دهد.",
    ogTitle: "Flixo — ابزارهای آنلاین هوش مصنوعی",
  },
  bn: {
    title: "Flixo — প্রতিটি AI টুলের জন্য একটি কর্মক্ষেত্র",
    description:
      "Flixo অনুবাদ, ছবি ও PDF সম্পাদনা এবং লেখা উন্নতির জন্য ফ্রি ও দ্রুত অনলাইন টুল সরাসরি ব্রাউজারে, নিবন্ধন ছাড়া প্রদান করে।",
    ogTitle: "Flixo — অনলাইন AI টুল",
  },
};

const EN_HOME: HomeCopy = {
  title: "Flixo — One Workspace for Every AI Tool",
  description:
    "Flixo is an AI task assistant that understands your intent, files, links, and media, and instantly selects the best workflow.",
  ogTitle: "Flixo — AI Task Assistant",
};

export function buildHomeHeadMetadata(locale: LocaleCode) {
  const copy = HOME_COPY[locale] ?? EN_HOME;
  return {
    meta: [
      { title: copy.title },
      { name: "description", content: copy.description },
      { property: "og:title", content: copy.ogTitle },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: getOgLocale(locale) },
      { property: "og:site_name", content: SITE_NAME },
    ],
    links: [{ rel: "canonical", href: getHomeUrl(locale) }, ...buildHomeHreflang()],
  };
}
