import type { TranslationSchema } from '../schema';
import TOOL_UI from '../tool-ui';

export const locale = {
  code: 'ar', dir: 'rtl',
  common: { processing: 'معالجة محلية على جهازك', download: 'تنزيل', clear: 'مسح', upload: 'رفع ملف', privacy: 'تتم معالجة الملفات محليًا داخل متصفحك عندما تدعم الأداة المعالجة المحلية.', notFoundTitle: 'الصفحة غير موجودة', notFoundDescription: 'اللغة أو الأداة المطلوبة غير متوفرة.' },
  commonToolUi: TOOL_UI.ar,
  glossary: { clientSideProcessing: 'معالجة محلية على جهازك' },
  tools: {
    'image-compressor': { title: 'ضاغط الصور', description: 'ضغط الصور مع معالجة محلية على جهازك.' },
    'background-remover': { title: 'إزالة الخلفية', description: 'إزالة خلفية الصور مع معالجة محلية على جهازك.' },
    'image-upscaler': { title: 'تكبير الصور', description: 'تكبير الصور مع معالجة محلية على جهازك.' },
    'image-converter': { title: 'محوّل الصور', description: 'تحويل صيغ الصور مع معالجة محلية على جهازك.' },
    'ai-image-generator': { title: 'مولّد الصور بالذكاء الاصطناعي', description: 'إنشاء الصور عبر خدمة ذكاء اصطناعي مهيأة.' },
    'object-remover': { title: 'إزالة العناصر', description: 'إزالة العناصر المحددة من الصور.' },
    'watermark-remover': { title: 'إزالة العلامة المائية', description: 'إزالة العلامات المائية المحددة من الصور.' },
    'image-cropper': { title: 'قصّ الصور', description: 'قص الصور إلى أبعاد دقيقة.' },
    'image-to-svg': { title: 'تحويل الصورة إلى SVG', description: 'تحويل الصور النقطية إلى SVG.' },
    'image-ocr': { title: 'التعرّف على النص من الصور', description: 'استخراج النص من الصور باستخدام OCR.' },
    'photo-colorizer': { title: 'تلوين الصور', description: 'تلوين الصور عبر خدمة ذكاء اصطناعي مهيأة.' },
    'background-blur': { title: 'تمويه الخلفية', description: 'تمويه خلفيات الصور.' },
    'passport-photo-maker': { title: 'منشئ صور جواز السفر', description: 'إنشاء قصّات قياسية لصور جواز السفر.' },
    'watermark-adder': { title: 'إضافة علامة مائية', description: 'إضافة علامة مائية إلى الصورة.' },
    'meme-generator': { title: 'منشئ الميمات', description: 'إنشاء ميمات مع عبارات توضيحية.' },
    'collage-maker': { title: 'منشئ الكولاج', description: 'دمج الصور في كولاج.' },
    'image-effects': { title: 'تأثيرات الصور', description: 'تطبيق تأثيرات شائعة على الصور.' },
    'exif-cleaner': { title: 'منظّف بيانات EXIF', description: 'إزالة بيانات EXIF من الصور.' },
    'svg-optimizer': { title: 'محسّن SVG', description: 'تحسين بنية SVG.' },
    'mockup-generator': { title: 'منشئ النماذج الجاهزة', description: 'إنشاء نماذج جاهزة بسيطة للصور.' },
    seed: { title: 'Seed', description: 'تطبيق تعديلات صور عبر GPU داخل المتصفح.' },
    pix: { title: 'استوديو Pix', description: 'تحرير الصور داخل استوديو يعمل في المتصفح.' },
  },
} satisfies TranslationSchema;

export default locale;
