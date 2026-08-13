/**
 * Per-locale SEO title/description templates for tool pages. Each locale
 * provides a native, grammatically correct title pattern plus a description
 * builder that wraps the localized tool name + tagline.
 *
 * `title(name)`        → "<LocalizedName> — <native 'free online tool'> | Flixo"
 * `description(name, tagline)` → native sentence using name + tagline
 * `descriptionFallback(name)`  → native sentence using name only
 * `homeTitle` / `homeDescription` → used when no localized tool name exists
 *
 * Brand "Flixo" is never translated. Technical identifiers (JSON, PDF, …)
 * arrive already-preserved inside `name`/`tagline` from the locale dictionary.
 */
import type { LocaleCode } from "@/lib/i18n";

export interface SeoTemplate {
  title: (name: string) => string;
  description: (name: string, tagline: string) => string;
  descriptionFallback: (name: string) => string;
  homeTitle: string;
  homeDescription: string;
}

export const SEO_TEMPLATES: Partial<Record<LocaleCode, SeoTemplate>> = {
  ar: {
    title: (n) => `${n} — أداة مجانية أونلاين | فليكسو`,
    description: (n, t) =>
      `${t} استخدم ${n} أونلاين مجانًا وسريعًا وآمنًا مباشرة عبر المتصفح في فليكسو بدون تسجيل.`,
    descriptionFallback: (n) =>
      `استخدم أداة ${n} أونلاين مجانًا وسريعًا وآمنًا مباشرة في متصفحك عبر فليكسو بدون تسجيل.`,
    homeTitle: "أدوات فليكسو المجانية أونلاين | Flixo Tools",
    homeDescription:
      "استخدم أدوات فليكسو المجانية والآمنة أونلاين مباشرة عبر المتصفح بدون الحاجة لتسجيل حساب.",
  },
  es: {
    title: (n) => `${n} — Herramienta online gratis | Flixo`,
    description: (n, t) =>
      `${t} Usa ${n} online gratis, rápido y seguro directamente en tu navegador en Flixo, sin registro.`,
    descriptionFallback: (n) =>
      `Usa ${n} online gratis, rápido y seguro directamente en tu navegador en Flixo, sin registro.`,
    homeTitle: "Herramientas online gratis de Flixo | Flixo Tools",
    homeDescription:
      "Usa las herramientas gratuitas y seguras de Flixo online directamente en tu navegador, sin necesidad de registrarse.",
  },
  fr: {
    title: (n) => `${n} — Outil en ligne gratuit | Flixo`,
    description: (n, t) =>
      `${t} Utilisez ${n} en ligne gratuitement, rapidement et en toute sécurité directement dans votre navigateur sur Flixo, sans inscription.`,
    descriptionFallback: (n) =>
      `Utilisez ${n} en ligne gratuitement, rapidement et en toute sécurité directement dans votre navigateur sur Flixo, sans inscription.`,
    homeTitle: "Outils en ligne gratuits Flixo | Flixo Tools",
    homeDescription:
      "Utilisez les outils gratuits et sûrs de Flixo en ligne directement dans votre navigateur, sans inscription.",
  },
  de: {
    title: (n) => `${n} — Kostenlos online | Flixo`,
    description: (n, t) =>
      `${t} Nutze ${n} online kostenlos, schnell und sicher direkt in deinem Browser auf Flixo, ohne Registrierung.`,
    descriptionFallback: (n) =>
      `Nutze ${n} online kostenlos, schnell und sicher direkt in deinem Browser auf Flixo, ohne Registrierung.`,
    homeTitle: "Kostenlose Online-Tools von Flixo | Flixo Tools",
    homeDescription:
      "Nutze die kostenlosen und sicheren Tools von Flixo online direkt in deinem Browser, ohne Registrierung.",
  },
  pt: {
    title: (n) => `${n} — Ferramenta online grátis | Flixo`,
    description: (n, t) =>
      `${t} Use ${n} online grátis, rápido e seguro diretamente no seu navegador na Flixo, sem registro.`,
    descriptionFallback: (n) =>
      `Use ${n} online grátis, rápido e seguro diretamente no seu navegador na Flixo, sem registro.`,
    homeTitle: "Ferramentas online grátis da Flixo | Flixo Tools",
    homeDescription:
      "Use as ferramentas gratuitas e seguras da Flixo online diretamente no seu navegador, sem necessidade de registro.",
  },
  it: {
    title: (n) => `${n} — Strumento online gratuito | Flixo`,
    description: (n, t) =>
      `${t} Usa ${n} online gratuitamente, veloce e sicuro direttamente nel tuo browser su Flixo, senza registrazione.`,
    descriptionFallback: (n) =>
      `Usa ${n} online gratuitamente, veloce e sicuro direttamente nel tuo browser su Flixo, senza registrazione.`,
    homeTitle: "Strumenti online gratuiti di Flixo | Flixo Tools",
    homeDescription:
      "Usa gli strumenti gratuiti e sicuri di Flixo online direttamente nel tuo browser, senza registrazione.",
  },
  nl: {
    title: (n) => `${n} — Gratis online tool | Flixo`,
    description: (n, t) =>
      `${t} Gebruik ${n} online gratis, snel en veilig direct in je browser op Flixo, zonder registratie.`,
    descriptionFallback: (n) =>
      `Gebruik ${n} online gratis, snel en veilig direct in je browser op Flixo, zonder registratie.`,
    homeTitle: "Gratis online tools van Flixo | Flixo Tools",
    homeDescription:
      "Gebruik de gratis en veilige tools van Flixo online direct in je browser, zonder registratie.",
  },
  pl: {
    title: (n) => `${n} — Darmowe narzędzie online | Flixo`,
    description: (n, t) =>
      `${t} Używaj ${n} online za darmo, szybko i bezpiecznie bezpośrednio w przeglądarce na Flixo, bez rejestracji.`,
    descriptionFallback: (n) =>
      `Używaj ${n} online za darmo, szybko i bezpiecznie bezpośrednio w przeglądarce na Flixo, bez rejestracji.`,
    homeTitle: "Darmowe narzędzia online Flixo | Flixo Tools",
    homeDescription:
      "Używaj darmowych i bezpiecznych narzędzi Flixo online bezpośrednio w przeglądarce, bez rejestracji.",
  },
  sv: {
    title: (n) => `${n} — Gratis onlineverktyg | Flixo`,
    description: (n, t) =>
      `${t} Använd ${n} online gratis, snabbt och säkert direkt i din webbläsare på Flixo, utan registrering.`,
    descriptionFallback: (n) =>
      `Använd ${n} online gratis, snabbt och säkert direkt i din webbläsare på Flixo, utan registrering.`,
    homeTitle: "Gratis onlineverktyg från Flixo | Flixo Tools",
    homeDescription:
      "Använd Flixos gratis och säkra verktyg online direkt i din webbläsare, utan registrering.",
  },
  tr: {
    title: (n) => `${n} — Ücretsiz çevrimiçi araç | Flixo`,
    description: (n, t) =>
      `${t} ${n} aracını Flixo'da kayıt olmadan, tarayıcınızda ücretsiz, hızlı ve güvenli şekilde çevrimiçi kullanın.`,
    descriptionFallback: (n) =>
      `${n} aracını Flixo'da kayıt olmadan, tarayıcınızda ücretsiz, hızlı ve güvenli şekilde çevrimiçi kullanın.`,
    homeTitle: "Flixo ücretsiz çevrimiçi araçlar | Flixo Tools",
    homeDescription:
      "Flixo'nun ücretsiz ve güvenli araçlarını kayıt olmadan doğrudan tarayıcınızda çevrimiçi kullanın.",
  },
  ro: {
    title: (n) => `${n} — Instrument online gratuit | Flixo`,
    description: (n, t) =>
      `${t} Folosește ${n} online gratuit, rapid și sigur direct în browserul tău pe Flixo, fără înregistrare.`,
    descriptionFallback: (n) =>
      `Folosește ${n} online gratuit, rapid și sigur direct în browserul tău pe Flixo, fără înregistrare.`,
    homeTitle: "Instrumente online gratuite Flixo | Flixo Tools",
    homeDescription:
      "Folosește instrumentele gratuite și sigure Flixo online direct în browserul tău, fără înregistrare.",
  },
  uk: {
    title: (n) => `${n} — Безкоштовний онлайн-інструмент | Flixo`,
    description: (n, t) =>
      `${t} Використовуйте ${n} онлайн безкоштовно, швидко й безпечно безпосередньо у браузері на Flixo, без реєстрації.`,
    descriptionFallback: (n) =>
      `Використовуйте ${n} онлайн безкоштовно, швидко й безпечно безпосередньо у браузері на Flixo, без реєстрації.`,
    homeTitle: "Безкоштовні онлайн-інструменти Flixo | Flixo Tools",
    homeDescription:
      "Використовуйте безкоштовні та безпечні інструменти Flixo онлайн безпосередньо у браузері, без реєстрації.",
  },
  ru: {
    title: (n) => `${n} — Бесплатный онлайн-инструмент | Flixo`,
    description: (n, t) =>
      `${t} Используйте ${n} онлайн бесплатно, быстро и безопасно прямо в браузере на Flixo, без регистрации.`,
    descriptionFallback: (n) =>
      `Используйте ${n} онлайн бесплатно, быстро и безопасно прямо в браузере на Flixo, без регистрации.`,
    homeTitle: "Бесплатные онлайн-инструменты Flixo | Flixo Tools",
    homeDescription:
      "Используйте бесплатные и безопасные инструменты Flixo онлайн прямо в браузере, без регистрации.",
  },
  id: {
    title: (n) => `${n} — Alat online gratis | Flixo`,
    description: (n, t) =>
      `${t} Gunakan ${n} online gratis, cepat dan aman langsung di browser Anda di Flixo, tanpa pendaftaran.`,
    descriptionFallback: (n) =>
      `Gunakan ${n} online gratis, cepat dan aman langsung di browser Anda di Flixo, tanpa pendaftaran.`,
    homeTitle: "Alat online gratis Flixo | Flixo Tools",
    homeDescription:
      "Gunakan alat Flixo yang gratis dan aman secara online langsung di browser Anda, tanpa pendaftaran.",
  },
  ms: {
    title: (n) => `${n} — Alat dalam talian percuma | Flixo`,
    description: (n, t) =>
      `${t} Gunakan ${n} dalam talian percuma, pantas dan selamat terus dalam pelayar anda di Flixo, tanpa pendaftaran.`,
    descriptionFallback: (n) =>
      `Gunakan ${n} dalam talian percuma, pantas dan selamat terus dalam pelayar anda di Flixo, tanpa pendaftaran.`,
    homeTitle: "Alat dalam talian percuma Flixo | Flixo Tools",
    homeDescription:
      "Gunakan alat Flixo yang percuma dan selamat secara dalam talian terus dalam pelayar anda, tanpa pendaftaran.",
  },
  vi: {
    title: (n) => `${n} — Công cụ trực tuyến miễn phí | Flixo`,
    description: (n, t) =>
      `${t} Dùng ${n} trực tuyến miễn phí, nhanh và an toàn ngay trong trình duyệt trên Flixo, không cần đăng ký.`,
    descriptionFallback: (n) =>
      `Dùng ${n} trực tuyến miễn phí, nhanh và an toàn ngay trong trình duyệt trên Flixo, không cần đăng ký.`,
    homeTitle: "Công cụ trực tuyến miễn phí Flixo | Flixo Tools",
    homeDescription:
      "Dùng các công cụ miễn phí và an toàn của Flixo trực tuyến ngay trong trình duyệt, không cần đăng ký.",
  },
  "zh-CN": {
    title: (n) => `${n} — 免费在线工具 | Flixo`,
    description: (n, t) => `${t} 在 Flixo 上免费、快速、安全地直接在浏览器中使用 ${n}，无需注册。`,
    descriptionFallback: (n) => `在 Flixo 上免费、快速、安全地直接在浏览器中使用 ${n}，无需注册。`,
    homeTitle: "Flixo 免费在线工具 | Flixo Tools",
    homeDescription: "直接在浏览器中使用 Flixo 的免费、安全的在线工具，无需注册。",
  },
  ja: {
    title: (n) => `${n} — 無料オンラインツール | Flixo`,
    description: (n, t) =>
      `${t} Flixoで${n}をブラウザ内で無料・高速・安全に、登録不要で直接ご利用ください。`,
    descriptionFallback: (n) =>
      `Flixoで${n}をブラウザ内で無料・高速・安全に、登録不要で直接ご利用ください。`,
    homeTitle: "Flixo 無料オンラインツール | Flixo Tools",
    homeDescription:
      "Flixoの無料で安全なオンラインツールをブラウザ内で直接、登録不要でご利用ください。",
  },
  ko: {
    title: (n) => `${n} — 무료 온라인 도구 | Flixo`,
    description: (n, t) =>
      `${t} Flixo에서 브라우저 내에서 ${n}을(를) 무료로 빠르고 안전하게, 가입 없이 바로 사용하세요.`,
    descriptionFallback: (n) =>
      `Flixo에서 브라우저 내에서 ${n}을(를) 무료로 빠르고 안전하게, 가입 없이 바로 사용하세요.`,
    homeTitle: "Flixo 무료 온라인 도구 | Flixo Tools",
    homeDescription:
      "Flixo의 무료이고 안전한 온라인 도구를 브라우저에서 직접, 가입 없이 사용하세요.",
  },
  el: {
    title: (n) => `${n} — Δωρεάν διαδικτυακό εργαλείο | Flixo`,
    description: (n, t) =>
      `${t} Χρησιμοποιήστε το ${n} δωρεάν, γρήγορα και με ασφάλεια απευθείας στον browser σας στο Flixo, χωρίς εγγραφή.`,
    descriptionFallback: (n) =>
      `Χρησιμοποιήστε το ${n} δωρεάν, γρήγορα και με ασφάλεια απευθείας στον browser σας στο Flixo, χωρίς εγγραφή.`,
    homeTitle: "Δωρεάν διαδικτυακά εργαλεία Flixo | Flixo Tools",
    homeDescription:
      "Χρησιμοποιήστε τα δωρεάν και ασφαλή διαδικτυακά εργαλεία του Flixo απευθείας στον browser σας, χωρίς εγγραφή.",
  },
  cs: {
    title: (n) => `${n} — Bezplatný online nástroj | Flixo`,
    description: (n, t) =>
      `${t} Použijte ${n} online bezplatně, rychle a bezpečně přímo ve vašem prohlížeči na Flixo, bez registrace.`,
    descriptionFallback: (n) =>
      `Použijte ${n} online bezplatně, rychle a bezpečně přímo ve vašem prohlížeči na Flixo, bez registrace.`,
    homeTitle: "Bezplatné online nástroje Flixo | Flixo Tools",
    homeDescription:
      "Používejte bezplatné a bezpečné online nástroje Flixo přímo ve vašem prohlížeči, bez registrace.",
  },
  th: {
    title: (n) => `${n} — เครื่องมือออนไลน์ฟรี | Flixo`,
    description: (n, t) =>
      `${t} ใช้ ${n} ออนไลน์ฟรี รวดเร็ว และปลอดภัย โดยตรงในเบราว์เซอร์ของคุณบน Flixo โดยไม่ต้องสมัคร`,
    descriptionFallback: (n) =>
      `ใช้ ${n} ออนไลน์ฟรี รวดเร็ว และปลอดภัย โดยตรงในเบราว์เซอร์ของคุณบน Flixo โดยไม่ต้องสมัคร`,
    homeTitle: "เครื่องมือออนไลน์ฟรีของ Flixo | Flixo Tools",
    homeDescription:
      "ใช้เครื่องมือออนไลน์ฟรีและปลอดภัยของ Flixo โดยตรงในเบราว์เซอร์ของคุณ โดยไม่ต้องสมัคร",
  },
  hi: {
    title: (n) => `${n} — मुफ़्त ऑनलाइन टूल | Flixo`,
    description: (n, t) =>
      `${t} Flixo पर बिना रजिस्टर किए सीधे अपने ब्राउज़र में ${n} को मुफ़्त, तेज़ और सुरक्षित रूप से उपयोग करें।`,
    descriptionFallback: (n) =>
      `Flixo पर बिना रजिस्टर किए सीधे अपने ब्राउज़र में ${n} को मुफ़्त, तेज़ और सुरक्षित रूप से उपयोग करें।`,
    homeTitle: "Flixo मुफ़्त ऑनलाइन टूल्स | Flixo Tools",
    homeDescription:
      "Flixo के मुफ़्त और सुरक्षित ऑनलाइन टूल्स को सीधे अपने ब्राउज़र में, बिना रजिस्टर किए उपयोग करें।",
  },
  he: {
    title: (n) => `${n} — כלי אונליין חינם | Flixo`,
    description: (n, t) =>
      `${t} השתמש ב-${n} אונליין בחינם, מהר ובבטחה ישירות בדפדפן שלך ב-Flixo, ללא הרשמה.`,
    descriptionFallback: (n) =>
      `השתמש ב-${n} אונליין בחינם, מהר ובבטחה ישירות בדפדפן שלך ב-Flixo, ללא הרשמה.`,
    homeTitle: "כלים אונליין חינם של Flixo | Flixo Tools",
    homeDescription:
      "השתמש בכלים האונליין החינמיים והמאובטחים של Flixo ישירות בדפדפן שלך, ללא הרשמה.",
  },
  fa: {
    title: (n) => `${n} — ابزار آنلاین رایگان | Flixo`,
    description: (n, t) =>
      `${t} از ${n} آنلاین به صورت رایگان، سریع و امن مستقیماً در مرورگر خود در Flixo، بدون ثبت‌نام استفاده کنید.`,
    descriptionFallback: (n) =>
      `از ${n} آنلاین به صورت رایگان، سریع و امن مستقیماً در مرورگر خود در Flixo، بدون ثبت‌نام استفاده کنید.`,
    homeTitle: "ابزارهای آنلاین رایگان Flixo | Flixo Tools",
    homeDescription:
      "از ابزارهای آنلاین رایگان و امن Flixo مستقیماً در مرورگر خود، بدون ثبت‌نام استفاده کنید.",
  },
  bn: {
    title: (n) => `${n} — ফ্রি অনলাইন টুল | Flixo`,
    description: (n, t) =>
      `${t} Flixo-এ আপনার ব্রাউজারে সরাসরি নিবন্ধন ছাড়া ${n} ফ্রি, দ্রুত ও নিরাপদে ব্যবহার করুন।`,
    descriptionFallback: (n) =>
      `Flixo-এ আপনার ব্রাউজারে সরাসরি নিবন্ধন ছাড়া ${n} ফ্রি, দ্রুত ও নিরাপদে ব্যবহার করুন।`,
    homeTitle: "Flixo ফ্রি অনলাইন টুল | Flixo Tools",
    homeDescription:
      "Flixo-এর ফ্রি ও নিরাপদ অনলাইন টুলগুলি সরাসরি আপনার ব্রাউজারে, নিবন্ধন ছাড়া ব্যবহার করুন।",
  },
};
