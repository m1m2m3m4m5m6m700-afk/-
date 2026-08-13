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

  // Tool names + taglines (76 ready tools) — اصطلاحات فنی فارسی بومی.
  "tool.translator.name": "مترجم هوش مصنوعی",
  "tool.translator.tagline": "بین 20+ زبان با تشخیص خودکار و جابجایی فوری ترجمه کنید.",
  "tool.image-enhancer.name": "بهبوددهنده تصویر هوش مصنوعی",
  "tool.image-enhancer.tagline":
    "وضوح را تا 8 برابر افزایش دهید، چهره‌ها را بازیابی، نویز را حذف و وضوح را بالا ببرید.",
  "tool.image-compressor.name": "فشرده‌ساز تصویر",
  "tool.image-compressor.tagline": "حجم فایل‌های تصویری را مستقیماً در مرورگر خود کاهش دهید.",
  "tool.background-remover.name": "حذف پس‌زمینه",
  "tool.background-remover.tagline": "پس‌زمینه تصاویر را ببرید و PNG شفاف صادر کنید.",
  "tool.video-compressor.name": "فشرده‌ساز ویدیو",
  "tool.video-compressor.tagline":
    "حجم فایل ویدیو را با کیفیت و تنظیمات خروجی قابل پیکربندی کاهش دهید.",
  "tool.video-trimmer.name": "برش ویدیو",
  "tool.video-trimmer.tagline": "بخش انتخاب‌شده‌ای از ویدیو را با کنترل شروع و پایان ببرید.",
  "tool.video-to-gif.name": "ویدیو به GIF",
  "tool.video-to-gif.tagline": "یک بخش ویدیوی پشتیبانی‌شده را به GIF متحرک تبدیل کنید.",
  "tool.audio-compressor.name": "فشرده‌ساز صوتی",
  "tool.audio-compressor.tagline": "فایل‌های صوتی را با کنترل کیفیت و نرخ بیت خروجی فشرده کنید.",
  "tool.audio-cutter.name": "برش صوتی",
  "tool.audio-cutter.tagline": "بخش انتخاب‌شده‌ای از یک فایل صوتی را با کنترل شروع و پایان ببرید.",
  "tool.text-to-speech.name": "متن به گفتار",
  "tool.text-to-speech.tagline":
    "متن نوشته‌شده را با صداهای قابل پیکربندی به گفتار طبیعی تبدیل کنید.",
  "tool.file-hash-generator.name": "تولیدکننده هش فایل",
  "tool.file-hash-generator.tagline":
    "هش‌های MD5، SHA-1 و SHA-256 هر فایلی را در مرورگر محاسبه کنید.",
  "tool.qr-generator.name": "تولیدکننده کد QR",
  "tool.qr-generator.tagline": "کدهای QR سفارشی برای پیوندها، متن، Wi-Fi و مخاطبین بسازید.",
  "tool.barcode-generator.name": "تولیدکننده بارکد",
  "tool.barcode-generator.tagline": "بارکدها در چند قالب تولید کنید، آماده برای دانلود یا چاپ.",
  "tool.password-generator.name": "تولیدکننده گذرواژه",
  "tool.password-generator.tagline": "گذرواژه‌های قوی و امن با شاخص آنتروپی تولید کنید.",
  "tool.password-checker.name": "بررسی گذرواژه",
  "tool.password-checker.tagline":
    "قدمت، آنتروپی و زمان تخمینی شکستن گذرواژه را با راهنمایی‌های عملی بررسی کنید.",
  "tool.word-counter.name": "شمارشگر کلمه",
  "tool.word-counter.tagline": "کلمات، نویسه‌ها، جملات و بندها را در هنگام تایپ فوراً بشمارید.",
  "tool.case-converter.name": "تبدیلگر بزرگی/کوچکی حروف",
  "tool.case-converter.tagline": "فوراً بین حروف بزرگ، کوچک، عنوان و سایر قالب‌ها جابجا شوید.",
  "tool.slug-generator.name": "تولیدکننده اسلاگ",
  "tool.slug-generator.tagline":
    "عنوان‌ها را به اسلاگ‌های تمیز و سازگار با URL با جداکننده و طول تبدیل کنید.",
  "tool.lorem-ipsum.name": "Lorem Ipsum",
  "tool.lorem-ipsum.tagline":
    "متن جایگزین Lorem Ipsum با تعداد بندها یا کلمات انتخاب‌شده تولید کنید.",
  "tool.random-number.name": "تولیدکننده عدد تصادفی",
  "tool.random-number.tagline":
    "اعداد تصادفی در یک بازه با گزینه‌های تعداد و بدون تکرار تولید کنید.",
  "tool.random-name.name": "انتخابگر نام تصادفی",
  "tool.random-name.tagline": "یک یا چند نام تصادفی از یک فهرست با گزینه بدون تکرار انتخاب کنید.",
  "tool.json-formatter.name": "قالب‌بندی JSON",
  "tool.json-formatter.tagline":
    "JSON را با گزینه‌های تورفتگی سفارشی زیبا، فشرده و اعتبارسنجی کنید.",
  "tool.uuid-generator.name": "تولیدکننده UUID",
  "tool.uuid-generator.tagline": "شناسه‌های UUID (v4) یکتا را سریع و انبوه تولید کنید.",
  "tool.xml-formatter.name": "قالب‌بندی XML",
  "tool.xml-formatter.tagline": "XML را با گزینه‌های تورفتگی سفارشی زیبا، فشرده و اعتبارسنجی کنید.",
  "tool.csv-viewer.name": "نمایشگر CSV",
  "tool.csv-viewer.tagline":
    "داده‌های CSV را به عنوان جدول با انتخاب جداکننده و تشخیص سربرگ پیش‌نمایش کنید.",
  "tool.text-compare.name": "مقایسه‌گر متن",
  "tool.text-compare.tagline":
    "دو متن را خط به خط مقایسه و افزوده‌ها، حذف‌ها و تطابق‌ها را برجسته کنید.",
  "tool.qr-reader.name": "خواننده QR",
  "tool.qr-reader.tagline": "کدهای QR را از تصاویر یا دوربین اسکن و به متن یا پیوند دیکد کنید.",
  "tool.find-and-replace.name": "جستجو و جایگزینی",
  "tool.find-and-replace.tagline":
    "متن را در اسناد طولانی با regex اختیاری و حساسیت به حروف جستجو و جایگزین کنید.",
  "tool.remove-duplicate-lines.name": "حذف خطوط تکراری",
  "tool.remove-duplicate-lines.tagline":
    "خطوط تکراری را با تطابق غیرحساس به حروف و آگاه به فضای خالی حذف کنید.",
  "tool.remove-empty-lines.name": "حذف خطوط خالی",
  "tool.remove-empty-lines.tagline": "خطوط خالی یا فقط شامل فضای خالی را فوراً حذف کنید.",
  "tool.text-cleaner.name": "پاک‌کننده متن",
  "tool.text-cleaner.tagline":
    "متن را با حذف فضاهای اضافی، شکستن خط و نویسه‌های ناخواسته پاک کنید.",
  "tool.sort-lines.name": "مرتب‌سازی خطوط",
  "tool.sort-lines.tagline":
    "خطوط را بر اساس حروف الفبا، طول مرتب یا با گزینه‌های حروف و خطوط خالی بهم بزنید.",
  "tool.reverse-text.name": "معکوس متن",
  "tool.reverse-text.tagline": "متن را بر اساس نویسه، کلمه یا کل خطوط فوراً معکوس کنید.",
  "tool.add-line-numbers.name": "افزودن شماره خط",
  "tool.add-line-numbers.tagline":
    "شماره خطوط متوالی با جداکننده‌ها، padding و انحراف شروع اضافه کنید.",
  "tool.word-frequency.name": "تحلیلگر بسامد کلمات",
  "tool.word-frequency.tagline":
    "بسامد کلمات را با مرتب‌سازی، حساسیت به حروف و فیلترهای طول تحلیل کنید.",
  "tool.unit-converter.name": "تبدیلگر واحد",
  "tool.unit-converter.tagline": "فوراً بین واحدهای طول، وزن، حجم و موارد دیگر تبدیل کنید.",
  "tool.temperature-converter.name": "تبدیلگر دما",
  "tool.temperature-converter.tagline": "سریع بین سانتی‌گراد، فارنهایت و کلوین تبدیل کنید.",
  "tool.base64-converter.name": "تبدیلگر Base64",
  "tool.base64-converter.tagline": "متن را به Base64 کدگذاری و دیکد کنید، فوراً.",
  "tool.timestamp-converter.name": "تبدیلگر مهر زمان",
  "tool.timestamp-converter.tagline":
    "مهرهای زمان Unix را به تاریخ‌های خوانا و برعکس، با پشتیبانی منطقه زمانی تبدیل کنید.",
  "tool.csv-to-json.name": "CSV به JSON",
  "tool.csv-to-json.tagline": "داده CSV را به JSON ساختاریافته با تشخیص خودکار سربرگ تبدیل کنید.",
  "tool.percentage-calculator.name": "ماشین‌حساب درصد",
  "tool.percentage-calculator.tagline": "درصدها، افزایش‌ها و تخفیف‌ها را سریع و دقیق محاسبه کنید.",
  "tool.bmi-calculator.name": "ماشین‌حساب شاخص توده بدنی",
  "tool.bmi-calculator.tagline": "شاخص توده بدنی را از وزن و قد محاسبه کنید.",
  "tool.age-calculator.name": "ماشین‌حساب سن",
  "tool.age-calculator.tagline": "سن دقیق خود را به سال، ماه و روز محاسبه کنید.",
  "tool.meta-tag-generator.name": "تولیدکننده متا تگ",
  "tool.meta-tag-generator.tagline":
    "متا تگ‌های HTML برای سئو با عنوان، توضیحات و Open Graph بسازید.",
  "tool.url-encoder.name": "کدگذار URL",
  "tool.url-encoder.tagline": "URL و اجزای URL را فوراً کدگذاری و دیکد کنید.",
  "tool.html-entity-encoder.name": "کدگذار موجودیت HTML",
  "tool.html-entity-encoder.tagline":
    "نویسه‌های خاص را به موجودیت‌های HTML و برعکس به متن خوانا تبدیل کنید.",
  "tool.html-minifier.name": "کوچک‌کننده HTML",
  "tool.html-minifier.tagline": "حجم HTML را با حذف فضاهای اضافی و نظرات کاهش دهید.",
  "tool.css-minifier.name": "کوچک‌کننده CSS",
  "tool.css-minifier.tagline": "CSS را با حذف فضاهای خالی، نظرات و قوانین زائد فشرده کنید.",
  "tool.js-minifier.name": "کوچک‌کننده JS",
  "tool.js-minifier.tagline": "JavaScript را با حذف فضاهای خالی و نظرات برای حجم کوچک‌تر کم کنید.",
  "tool.json-validator.name": "اعتبارسنج JSON",
  "tool.json-validator.tagline": "ساختار JSON را اعتبارسنجی و خطاها را فوراً پیدا کنید.",
  "tool.regex-tester.name": "آزمایگر regex",
  "tool.regex-tester.tagline": "عبارات منظم را آزمایش و تطابق‌ها را در زمان واقعی برجسته کنید.",
  "tool.jwt-decoder.name": "دیکدر JWT",
  "tool.jwt-decoder.tagline": "توکن‌های JWT را دیکد و محتوای سربرگ و payload را بررسی کنید.",
  "tool.sql-formatter.name": "قالب‌بندی SQL",
  "tool.sql-formatter.tagline":
    "پرس‌وجو‌های SQL را با کلمات کلیدی بزرگ و تورفتگی قابل پیکربندی زیبا و فشرده کنید.",
  "tool.markdown-preview.name": "پیش‌نمایش Markdown",
  "tool.markdown-preview.tagline": "Markdown بنویسید و پیش‌نمایش HTML رندرشده را فوراً ببینید.",
  "tool.color-converter.name": "تبدیلگر رنگ",
  "tool.color-converter.tagline": "بین HEX، RGB و HSL تبدیل و رنگ را پیش‌نمایش کنید.",
  "tool.cron-parser.name": "تحلیلگر Cron",
  "tool.cron-parser.tagline":
    "عبارات cron را به زبان ساده با تفکیک فیلدها و اجراهای بعدی ترجمه کنید.",
  "tool.xml-validator.name": "اعتبارسنج XML",
  "tool.xml-validator.tagline": "قالب، تعادل تگ و ساختار XML را با گزارش فوری خطا اعتبارسنجی کنید.",
  "tool.html-formatter.name": "قالب‌بندی HTML",
  "tool.html-formatter.tagline":
    "HTML را با تودرتویی صحیح و تورفتگی قابل پیکربندی زیبا و فشرده کنید.",
  "tool.yaml-formatter.name": "قالب‌بندی YAML",
  "tool.yaml-formatter.tagline":
    "YAML را با تورفتگی و اعتبارسنجی قابل پیکربندی زیبا و نرمال‌سازی کنید.",
  "tool.markdown-table-generator.name": "تولیدکننده جدول Markdown",
  "tool.markdown-table-generator.tagline":
    "جداول Markdown را بصری بسازید و آماده‌ی چسباندن صادر کنید.",
  "tool.css-gradient-generator.name": "تولیدکننده گرادیان CSS",
  "tool.css-gradient-generator.tagline":
    "گرادیان‌های خطی، شعاعی و مخروطی CSS با توقف‌های رنگ و کنترل زاویه طراحی کنید.",
  "tool.audio-converter.name": "تبدیلگر صوتی",
  "tool.audio-converter.tagline":
    "فایل‌های صوتی (MP3، OGG، FLAC و غیره) را به WAV در مرورگر تبدیل کنید.",
  "tool.video-converter.name": "تبدیلگر ویدیو",
  "tool.video-converter.tagline": "ویدیو را به MP4 (H.264) یا AVI (MPEG-4) در مرورگر تبدیل کنید.",
  "tool.gif-maker.name": "سازنده GIF",
  "tool.gif-maker.tagline": "یک GIF متحرک از تصاویر بارگذاری‌شده یا ویدیوی پشتیبانی‌شده بسازید.",
  "tool.gif-compressor.name": "فشرده‌ساز GIF",
  "tool.gif-compressor.tagline":
    "حجم فایل GIF را کاهش دهید در حالی که کیفیت تصویری قابل قبول حفظ می‌شود.",
  "tool.image-to-gif.name": "تصویر به GIF",
  "tool.image-to-gif.tagline": "یک GIF متحرک از چند تصویر بارگذاری‌شده بسازید.",
  "tool.pdf-to-excel.name": "PDF به Excel",
  "tool.pdf-to-excel.tagline": "جدول‌ها و محتوای مناسب PDF را به فایل سازگار با Excel تبدیل کنید.",
  "tool.pdf-to-powerpoint.name": "PDF به PowerPoint",
  "tool.pdf-to-powerpoint.tagline":
    "صفحات و محتوای مناسب PDF را به فایل سازگار با PowerPoint تبدیل کنید.",
  "tool.pdf-to-text.name": "PDF به متن",
  "tool.pdf-to-text.tagline": "متن قابل‌انتخاب را از اسناد PDF استخراج کنید.",
  "tool.pdf-crop.name": "برش PDF",
  "tool.pdf-crop.tagline": "صفحات PDF را با محدوده‌های برش قابل پیکربندی ببرید.",
  "tool.pdf-page-numbers.name": "شماره صفحات PDF",
  "tool.pdf-page-numbers.tagline": "شماره صفحات قابل پیکربندی به صفحات PDF اضافه کنید.",
  "tool.pdf-header-footer.name": "سربرگ و پاورقی PDF",
  "tool.pdf-header-footer.tagline":
    "سربرگ‌ها و پاورقی‌های قابل سفارشی‌سازی به صفحات PDF اضافه کنید.",
  "tool.text-to-pdf.name": "متن به PDF",
  "tool.text-to-pdf.tagline": "متن واردشده یا چسبانده‌شده را به PDF قابل دانلود تبدیل کنید.",
  "tool.text-to-word.name": "متن به Word",
  "tool.text-to-word.tagline": "متن واردشده یا چسبانده‌شده را به سند DOCX قابل دانلود تبدیل کنید.",
  "tool.markdown-to-pdf.name": "Markdown به PDF",
  "tool.markdown-to-pdf.tagline": "محتوای Markdown را به PDF قالب‌بندی‌شده تبدیل کنید.",
  "tool.markdown-to-word.name": "Markdown به Word",
  "tool.markdown-to-word.tagline": "محتوای Markdown را به سند DOCX قالب‌بندی‌شده تبدیل کنید.",
};
