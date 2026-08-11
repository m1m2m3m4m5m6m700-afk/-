import type { Dictionary } from "./en";
import { en } from "./en";

export const fa: Dictionary = {
  ...en,

  "lang.name": "فارسی",
  "lang.switch": "تغییر زبان",

  "nav.tools": "ابزارها",
  "nav.categories": "دسته‌بندی‌ها",
  "nav.popular": "محبوب",
  "nav.why": "چرا فلیکسو",
  "nav.faq": "سوالات متداول",
  "nav.openTranslator": "باز کردن مترجم",
  "nav.toggleTheme": "تغییر تم رنگی",
  "nav.toggleMenu": "باز/بسته کردن منو",

  "hero.badge": "یک فضای کاری، همه ابزارهای هوش مصنوعی",
  "hero.title": "یک فضای کاری برای هر ابزار هوش مصنوعی",
  "hero.description":
    "ترجمه، تصاویر، PDF، نوشتن و ابزارهای کمکی — پنج مرکز ابزار در یک رابط کاربری آرام. بدون حساب کاربری و کلید API؛ ابزاری را باز کنید و شروع کنید.",
  "hero.promo.badge": "جدید",
  "hero.promo.body":
    "امروز بهبوددهنده تصویر با هوش مصنوعی را امتحان کنید — تصاویر را واضح، بزرگ و بدون نویز کنید.",
  "hero.searchLabel": "توضیح دهید چه می‌خواهید انجام دهید",
  "hero.searchPlaceholder":
    "امتحان کنید: «این را به عربی ترجمه کن»، «یک PDF را خلاصه کن»، «یک تصویر بساز»…",
  "hero.browse": "مرور ابزارها",
  "hero.cta": "امتحان مترجم",
  "hero.note": "رایگان · بدون ثبت‌نام",

  "assistant.eyebrow": "دستیار هوش مصنوعی",
  "assistant.title": "بگو چه چیزی نیاز داری — ابزار درست را پیدا می‌کنم",
  "assistant.placeholder": "وظیفه‌ات را توصیف کن… مثلاً «یک پاراگراف را به فرانسوی ترجمه کن»",
  "assistant.button": "پیدا کردن ابزار",
  "assistant.thinking": "در حال فکر کردن…",
  "assistant.reset": "سوال دیگری بپرس",
  "assistant.result.category": "دسته",
  "assistant.result.matched": "تطابق",
  "assistant.result.open": "باز کردن ابزار",
  "assistant.result.soon": "به‌زودی",
  "assistant.suggestion.translation":
    "به نظر می‌رسد می‌خواهی متن ترجمه کنی. مترجم برای تو آماده است.",
  "assistant.suggestion.images":
    "می‌خواهی با تصاویر کار کنی. هنوز ابزار تصویری موجود نیست — یکی درخواست کن تا اولویت دهیم.",
  "assistant.suggestion.pdf":
    "از PDF صحبت کردی. هنوز ابزار PDF موجود نیست — یکی درخواست کن تا اولویت دهیم.",
  "assistant.suggestion.writing":
    "به کمک نوشتن نیاز داری. هنوز ابزار نوشتاری موجود نیست — یکی درخواست کن تا اولویت دهیم.",
  "assistant.suggestion.utilities":
    "به یک ابزار کمکی نیاز داری. هنوز موجود نیست — یکی درخواست کن تا اولویت دهیم.",
  "assistant.suggestion.unknown":
    "مطمئن نیستم کدام دسته می‌خورد. بیشتر توضیح بده یا ابزار جدیدی درخواست کن.",
  "assistant.empty.title": "پیشنهاد تو اینجا ظاهر می‌شود",
  "assistant.empty.body":
    "بالا یک وظیفه بنویس تا دستیار تو را به ابزار فلیکسوی درست هدایت کند — یا برای درخواست ابزار جدید کمک کند.",

  "request.trigger": "درخواست ابزار",
  "request.title": "درخواست ابزار جدید",
  "request.description": "به ما بگو چه چیزی نیاز داری تا برای نسخه بعد اولویتش دهیم.",
  "request.label": "ابزار باید چه کاری انجام دهد؟",
  "request.placeholder": "مثلاً ابزاری که PDF را به Word تبدیل کند و قالب‌بندی را حفظ کند…",
  "request.submit": "ارسال درخواست",
  "request.cancel": "لغو",
  "request.success": "ممنون! درخواستت ثبت شد — برای نسخه بعد اولویتش می‌دهیم.",
  "request.ok": "انجام شد",

  "categories.eyebrow": "مراکز ابزار",
  "categories.title": "پنج مرکز، یک فضا",
  "categories.description":
    "هر ابزار فلیکسو در یکی از این مراکز قرار دارد. فعلاً جای‌نگهدار هستند — پایه برای رشد آماده است.",
  "categories.status.coming": "به‌زودی",
  "categories.status.live": "{count} موجود",
  "categories.toolsLabel": "ابزارهای برنامه‌ریزی‌شده",
  "status.live": "موجود",
  "status.soon": "به‌زودی",

  "category.translation.name": "مرکز ترجمه",
  "category.translation.blurb":
    "با تشخیص خودکار به بیش از ۲۰ زبان ترجمه، بومی‌سازی و زیرنویس کنید.",
  "category.translation.tools": "مترجم · بومی‌ساز · مترجم زیرنویس",
  "category.images.name": "ابزارهای تصویر",
  "category.images.blurb": "تصاویر را بسازید، بزرگ کنید و پس‌زمینه‌ها را حذف کنید.",
  "category.images.tools": "سازنده تصویر · بزرگ‌کننده · حذف پس‌زمینه",
  "category.pdf.name": "ابزارهای PDF",
  "category.pdf.blurb": "اسناد PDF را ادغام، تقسیم، فشرده و تبدیل کنید.",
  "category.pdf.tools": "ادغام · تقسیم · فشرده · PDF به Word",
  "category.writing.name": "نوشتن با هوش مصنوعی",
  "category.writing.blurb": "خلاصه، بازنویسی و محتوای با لحن درست بسازید.",
  "category.writing.tools": "خلاصه‌ساز · بازنویس · نویسنده ایمیل",
  "category.utilities.name": "ابزارهای کمکی",
  "category.utilities.blurb": "تکه‌های فنی روزمره را قالب‌بندی، تبدیل و تولید کنید.",
  "category.utilities.tools": "قالب‌بند JSON · سازنده QR · مبدل Base64",
  "category.developer.name": "ابزارهای توسعه‌دهنده",
  "category.developer.blurb": "قالب‌بندها، اعتبارسنج‌ها و تولیدکننده‌ها برای کد روزمره.",
  "category.developer.tools": "قالب‌بند JSON · اعتبارسنج XML · تجزیه‌گر Cron",

  "tool.back": "همه ابزارها",

  "why.eyebrow": "چرا فلیکسو",
  "why.title": "ساخته شده برای حذف اصطکاک، نه افزودن قابلیت",
  "why.speed.title": "پیش‌فرض فوری",
  "why.speed.body":
    "ابزارها در کمتر از یک ثانیه باز می‌شوند و در مرورگر اجرا می‌شوند — بدون صف و بدون راه‌اندازی سرد.",
  "why.consistency.title": "یک رابط یکپارچه",
  "why.consistency.body":
    "هر ابزار چیدمان، میانبرها و عملکردهای نتیجه را به اشتراک می‌گذارد، چیزی برای یادگیری مجدد نیست.",
  "why.privacy.title": "حریم خصوصی در اولویت",
  "why.privacy.body":
    "بین جلسات چیزی ذخیره نمی‌شود. ورودی تو در همان زبانه‌ای که تایپش کردی می‌ماند.",
  "why.access.title": "بدون حساب، بدون کلید",
  "why.access.body": "بدون کلید API، داشبورد یا مدیریت مجوز. ابزاری را باز کن و شروع کن.",
  "stats.tasks": "وظایف پردازش‌شده",
  "stats.languages": "زبان‌های پشتیبانی‌شده",
  "stats.latency": "میانه زمان پاسخ",
  "stats.uptime": "زمان فعالیت ۱۲ ماه گذشته",

  "faq.eyebrow": "سوالات متداول",
  "faq.title": "سوالات، پاسخ داده شده",
  "faq.description": "هرآنچه قبل از باز کردن اولین ابزار ارزش دانستن دارد.",
  "faq.q1": "آیا فلیکسو رایگان است؟",
  "faq.a1": "بله. همه ابزارهای موجود فعلاً در فلیکسو رایگان هستند و نیازی به حساب یا کارت ندارند.",
  "faq.q2": "مترجم چطور کار می‌کند؟",
  "faq.a2":
    "متن را جای‌گذاری می‌کنی، زبان مبدأ و مقصد را انتخاب می‌کنی (یا تشخیص خودکار را می‌گذاری) و فلیکسو ترجمه را برمی‌گرداند. نسخه فعلی از یک موتور دموی محلی برای کاوش آفلاین استفاده می‌کند.",
  "faq.q3": "آیا آنچه را می‌نویسم ذخیره می‌کنید؟",
  "faq.a3":
    "خیر. ورودی و خروجی فقط در زبانه مرورگر تو وجود دارند و با بستن یا پاک کردن ابزار ناپدید می‌شوند.",
  "faq.q4": "چه زبان‌هایی پشتیبانی می‌شوند؟",
  "faq.a4": "بیست زبان در خطوط لاتین، سیریلیک، عربی، عبری، هندی و CJK، به‌علاوه تشخیص خودکار مبدأ.",
  "faq.q5": "سایر ابزارها کی منتشر می‌شوند؟",
  "faq.a5":
    "پنج مرکز — ترجمه، تصاویر، PDF، نوشتن و ابزارهای کمکی — نقشه راه هستند. ابزارهای جدید به همان ثبت متصل می‌شوند و چیدمان مشترک را به ارث می‌برند.",

  "footer.tagline":
    "یک فضای کاری آرام برای هر ابزار هوش مصنوعی که تیمت در طول روز به آن مراجعه می‌کند.",
  "footer.product": "محصول",
  "footer.featured": "ابزارهای منتخب",
  "footer.popular": "ابزارهای محبوب",
  "footer.numbers": "اعداد",
  "footer.categories": "دسته‌بندی‌ها",
  "footer.tools": "ابزارها",
  "footer.more": "بیشتر به‌زودی",
  "footer.rights": "© {year} فلیکسو. تمام حقوق محفوظ است.",
  "footer.built": "ساخته‌شده برای تیم‌هایی که سریع تحویل می‌دهند.",

  "translator.pageDescription":
    "زبان مبدأ را به‌صورت خودکار تشخیص می‌دهد و در چند ثانیه ترجمه می‌کند.",
  "translator.from": "از",
  "translator.to": "به",
  "translator.auto": "تشخیص خودکار",
  "translator.swap": "تعویض زبان‌ها",
  "translator.inputPlaceholder": "متن برای ترجمه را تایپ یا جای‌گذاری کنید…",
  "translator.inputLabel": "متن برای ترجمه",
  "translator.detected": "تشخیص داده شد {language}",
  "translator.copy": "کپی",
  "translator.copied": "کپی شد",
  "translator.copyError": "امکان کپی در کلیپ‌بورد نبود.",
  "translator.genericError": "اشکالی پیش آمد. دوباره تلاش کنید.",
  "translator.clear": "پاک کردن",
  "translator.translate": "ترجمه",
  "translator.translating": "در حال ترجمه…",
  "translator.emptyTitle": "ترجمه شما اینجا ظاهر می‌شود",
  "translator.emptyBody":
    "یک زبان مقصد انتخاب کنید، متن وارد کنید و ترجمه را بزنید. تشخیص خودکار مبدأ را پیدا می‌کند.",
};
