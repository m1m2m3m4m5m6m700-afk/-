export type Locale = 'en' | 'ar';

export const LOCALES: readonly Locale[] = ['en', 'ar'];
export const DEFAULT_LOCALE: Locale = 'en';

export const localeMeta = {
  en: { htmlLang: 'en', dir: 'ltr', name: 'English', pathPrefix: '/en' },
  ar: { htmlLang: 'ar', dir: 'rtl', name: 'العربية', pathPrefix: '/ar' },
} as const;

type LocalizedText = { en: string; ar: string };

type LocalizedTool = LocalizedText & {
  keywords: { en: readonly string[]; ar: readonly string[] };
};

export const TOOL_I18N: Readonly<Record<string, LocalizedTool>> = Object.freeze({
  'image-compressor': { en: 'Image Compressor', ar: 'ضغط الصور', keywords: { en: ['image compressor', 'compress jpg', 'compress png', 'reduce image size'], ar: ['ضغط الصور', 'تصغير حجم الصورة', 'ضغط JPG', 'ضغط PNG'] } },
  'background-remover': { en: 'Background Remover', ar: 'إزالة خلفية الصورة', keywords: { en: ['background remover', 'remove image background'], ar: ['إزالة الخلفية', 'مسح خلفية الصورة'] } },
  'image-upscaler': { en: 'Image Upscaler', ar: 'تحسين دقة الصورة', keywords: { en: ['image upscaler', 'increase image resolution'], ar: ['تحسين دقة الصورة', 'تكبير الصورة', 'رفع جودة الصورة'] } },
  'image-converter': { en: 'Image Converter', ar: 'تحويل صيغ الصور', keywords: { en: ['image converter', 'convert jpg png webp'], ar: ['تحويل الصور', 'تحويل JPG PNG WebP'] } },
  'ai-image-generator': { en: 'AI Image Generator', ar: 'مولد الصور بالذكاء الاصطناعي', keywords: { en: ['AI image generator', 'generate images'], ar: ['مولد صور بالذكاء الاصطناعي', 'إنشاء الصور بالذكاء الاصطناعي'] } },
  'image-to-text': { en: 'Image to Text OCR', ar: 'تحويل الصورة إلى نص OCR', keywords: { en: ['image to text', 'OCR online'], ar: ['تحويل الصورة إلى نص', 'استخراج النص من الصورة', 'OCR'] } },
  'object-remover': { en: 'Object Remover', ar: 'إزالة العناصر من الصورة', keywords: { en: ['object remover', 'remove object from image'], ar: ['إزالة عنصر من الصورة', 'مسح شيء من الصورة'] } },
  'crop-resize': { en: 'Crop & Resize', ar: 'قص وتغيير أبعاد الصورة', keywords: { en: ['crop image', 'resize image'], ar: ['قص الصورة', 'تغيير أبعاد الصورة'] } },
  'watermark-remover': { en: 'Watermark Remover', ar: 'إزالة العلامة المائية', keywords: { en: ['watermark remover'], ar: ['إزالة العلامة المائية'] } },
  'raster-to-svg': { en: 'Raster to SVG', ar: 'تحويل Raster إلى SVG', keywords: { en: ['raster to svg'], ar: ['تحويل Raster إلى SVG'] } },
  'image-cropper': { en: 'Image Cropper', ar: 'قص الصور', keywords: { en: ['image cropper', 'crop photo'], ar: ['قص الصور', 'قص الصورة'] } },
  'image-ocr': { en: 'Image OCR', ar: 'استخراج النص من الصور', keywords: { en: ['image OCR', 'extract text from image'], ar: ['OCR للصور', 'استخراج النص من الصور'] } },
  'photo-colorizer': { en: 'Photo Colorizer', ar: 'تلوين الصور', keywords: { en: ['photo colorizer', 'colorize old photo'], ar: ['تلوين الصور', 'تلوين الصور القديمة'] } },
  'background-blur': { en: 'Background Blur', ar: 'طمس الخلفية', keywords: { en: ['background blur'], ar: ['طمس الخلفية', 'ضبابية الخلفية'] } },
  'passport-photo-maker': { en: 'Passport Photo Maker', ar: 'صانع صور جواز السفر', keywords: { en: ['passport photo maker'], ar: ['صور جواز السفر', 'صورة جواز سفر'] } },
  'watermark-adder': { en: 'Watermark Adder', ar: 'إضافة علامة مائية', keywords: { en: ['add watermark'], ar: ['إضافة علامة مائية'] } },
  'meme-generator': { en: 'Meme Generator', ar: 'مولد الميمز', keywords: { en: ['meme generator'], ar: ['مولد الميمز', 'صناعة الميمز'] } },
  'collage-maker': { en: 'Collage Maker', ar: 'صانع الكولاج', keywords: { en: ['collage maker'], ar: ['صانع الكولاج', 'دمج الصور'] } },
  'image-effects': { en: 'Image Effects', ar: 'تأثيرات الصور', keywords: { en: ['image effects', 'photo effects'], ar: ['تأثيرات الصور', 'مؤثرات الصور'] } },
  'exif-cleaner': { en: 'EXIF Cleaner', ar: 'حذف بيانات EXIF', keywords: { en: ['EXIF cleaner', 'remove photo metadata'], ar: ['حذف EXIF', 'حذف بيانات الصورة'] } },
  'svg-optimizer': { en: 'SVG Optimizer', ar: 'تحسين ملفات SVG', keywords: { en: ['SVG optimizer'], ar: ['تحسين SVG', 'ضغط SVG'] } },
  'mockup-generator': { en: 'Mockup Generator', ar: 'مولد نماذج العرض Mockup', keywords: { en: ['mockup generator'], ar: ['مولد Mockup', 'نموذج عرض الصورة'] } },
  seed: { en: 'Seed', ar: 'Seed', keywords: { en: ['browser image editor'], ar: ['محرر صور داخل المتصفح'] } },
  pix: { en: 'Pix Studio', ar: 'استوديو Pix', keywords: { en: ['browser image editor', 'Pix Studio'], ar: ['محرر الصور', 'استوديو Pix'] } },
});

const TOOL_DESCRIPTIONS: Readonly<Record<string, LocalizedText>> = Object.freeze({
  'image-compressor': { en: 'Reduce JPG, PNG, and WebP file size directly in your browser.', ar: 'قلّل حجم صور JPG وPNG وWebP مباشرة داخل متصفحك.' },
  'background-remover': { en: 'Remove simple image backgrounds locally in your browser.', ar: 'أزل الخلفيات البسيطة للصور محليًا داخل متصفحك.' },
  'image-upscaler': { en: 'Increase image dimensions with high-quality browser processing.', ar: 'ارفع أبعاد الصورة وحسّن جودتها عبر معالجة داخل المتصفح.' },
  'image-converter': { en: 'Convert common image formats directly in your browser.', ar: 'حوّل صيغ الصور الشائعة مباشرة داخل متصفحك.' },
  'ai-image-generator': { en: 'Create images through FLIXO’s configured AI image service.', ar: 'أنشئ صورًا عبر خدمة الصور بالذكاء الاصطناعي المهيأة في FLIXO.' },
  'image-to-text': { en: 'Extract readable text from images with browser OCR.', ar: 'استخرج النصوص المقروءة من الصور باستخدام OCR داخل المتصفح.' },
  'object-remover': { en: 'Remove a selected object region with local reconstruction.', ar: 'أزل منطقة محددة من الصورة مع إعادة بناء محلية.' },
  'crop-resize': { en: 'Crop images and resize them to the dimensions you need.', ar: 'اقصص الصور وغيّر أبعادها إلى المقاس الذي تحتاجه.' },
  'watermark-remover': { en: 'Clean a selected watermark region locally.', ar: 'نظّف منطقة العلامة المائية المحددة محليًا.' },
  'raster-to-svg': { en: 'Convert a raster image into a downloadable SVG wrapper.', ar: 'حوّل صورة Raster إلى ملف SVG قابل للتنزيل.' },
  'image-cropper': { en: 'Crop and resize images for exact dimensions.', ar: 'اقصص الصور وغيّر أبعادها إلى مقاسات دقيقة.' },
  'image-ocr': { en: 'Extract text from images with OCR.', ar: 'استخرج النصوص من الصور باستخدام OCR.' },
  'photo-colorizer': { en: 'Colorize photos through a configured AI endpoint.', ar: 'لوّن الصور عبر نقطة خدمة ذكاء اصطناعي مهيأة.' },
  'background-blur': { en: 'Blur background regions locally.', ar: 'اطمس مناطق الخلفية محليًا.' },
  'passport-photo-maker': { en: 'Create a standard portrait crop for ID-style photos.', ar: 'أنشئ قصّة صورة شخصية قياسية للصور الرسمية.' },
  'watermark-adder': { en: 'Add text watermarks directly in the browser.', ar: 'أضف علامات مائية نصية مباشرة داخل المتصفح.' },
  'meme-generator': { en: 'Create captioned memes quickly from your image.', ar: 'أنشئ ميمز مع نصوص على صورك بسرعة.' },
  'collage-maker': { en: 'Combine multiple images into a simple collage.', ar: 'ادمج عدة صور في كولاج بسيط.' },
  'image-effects': { en: 'Apply useful image adjustments in the browser.', ar: 'طبّق تعديلات مفيدة على الصورة داخل المتصفح.' },
  'exif-cleaner': { en: 'Remove image metadata by browser re-encoding.', ar: 'احذف بيانات الصورة الوصفية عبر إعادة ترميز داخل المتصفح.' },
  'svg-optimizer': { en: 'Minify SVG whitespace and comments locally.', ar: 'قلّل المسافات والتعليقات غير اللازمة في SVG محليًا.' },
  'mockup-generator': { en: 'Create a simple device mockup from an image.', ar: 'أنشئ نموذج عرض بسيطًا للصورة داخل جهاز.' },
  seed: { en: 'Non-destructive GPU image adjustments in the browser.', ar: 'تعديلات صور غير تدميرية باستخدام GPU داخل المتصفح.' },
  pix: { en: 'Professional browser-based image editing with advanced creative controls.', ar: 'تحرير احترافي للصور داخل المتصفح مع أدوات إبداعية متقدمة.' },
});

export function getToolLocale(id: string, locale: Locale) {
  const item = TOOL_I18N[id];
  if (!item) return { title: id, description: id, keywords: [] as readonly string[] };
  return { title: item[locale], description: TOOL_DESCRIPTIONS[id]?.[locale] ?? '', keywords: item.keywords[locale] };
}

export const HOMEPAGE_COPY = {
  en: { title: 'FLIXO | Fast, Local-First Image Workflows', description: 'Tell FLIXO the result you want. Use local-first image tools and focused workflows without learning a giant editor.' },
  ar: { title: 'FLIXO | مسارات صور سريعة ومحلية', description: 'أخبر FLIXO بالنتيجة التي تريدها. استخدم أدوات الصور والمسارات الذكية مع معالجة محلية عندما تدعمها الأداة.' },
} as const;
