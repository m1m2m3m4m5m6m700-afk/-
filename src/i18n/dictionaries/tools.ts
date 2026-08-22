export type ToolUiLocale = 'en' | 'ar';

export const TOOL_UI_DICTIONARY = {
  en: {
    processing: 'Processing locally...',
    runTool: 'Run tool',
    downloadNow: 'Download now',
    chooseImage: 'Choose an image first.',
    clientSide: 'Client-side processing. Your file stays in the browser unless this tool explicitly requires a configured AI endpoint.',
    result: 'RESULT',
    noResult: 'No result yet.',
    dragDrop: 'Drag & drop image or click to upload',
    watermarkText: 'Watermark text',
    topText: 'TOP TEXT',
    bottomText: 'BOTTOM TEXT',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    grayscale: 'Grayscale',
    error: 'Operation failed.',
    formatStatus: (width: number | undefined, height: number | undefined, kb: number) => `${width ?? ''}×${height ?? ''} · ${kb} KB`,
    titles: {
      'photo-colorizer': 'Photo Colorizer', 'background-blur': 'Background Blur', 'passport-photo-maker': 'Passport Photo Maker',
      'watermark-adder': 'Add Watermark', 'meme-generator': 'Meme Generator', 'collage-maker': 'Collage Maker',
      'image-effects': 'Image Effects', 'exif-cleaner': 'EXIF Cleaner', 'svg-optimizer': 'SVG Optimizer',
      'mockup-generator': 'Mockup Generator', 'image-to-svg': 'Image to SVG',
    },
  },
  ar: {
    processing: 'جارٍ المعالجة محليًا...', runTool: 'تنفيذ الأداة', downloadNow: 'تنزيل النتيجة',
    chooseImage: 'اختر صورة أولًا.', clientSide: 'تتم المعالجة داخل المتصفح، وتبقى الصورة على جهازك ما لم تتطلب الأداة نقطة خدمة ذكاء اصطناعي مهيأة.',
    result: 'النتيجة', noResult: 'لا توجد نتيجة بعد.', dragDrop: 'اسحب الصورة هنا أو اضغط لاختيارها',
    watermarkText: 'نص العلامة المائية', topText: 'النص العلوي', bottomText: 'النص السفلي', brightness: 'السطوع',
    contrast: 'التباين', saturation: 'التشبّع', grayscale: 'تدرج رمادي', error: 'تعذر تنفيذ العملية.',
    formatStatus: (width: number | undefined, height: number | undefined, kb: number) => `${width ?? ''}×${height ?? ''} · ${kb} كيلوبايت`,
    titles: {
      'photo-colorizer': 'تلوين الصور', 'background-blur': 'طمس الخلفية', 'passport-photo-maker': 'صانع صور جواز السفر',
      'watermark-adder': 'إضافة علامة مائية', 'meme-generator': 'مولد الميمز', 'collage-maker': 'صانع الكولاج',
      'image-effects': 'تأثيرات الصور', 'exif-cleaner': 'حذف بيانات EXIF', 'svg-optimizer': 'تحسين SVG',
      'mockup-generator': 'مولد النماذج Mockup', 'image-to-svg': 'تحويل الصورة إلى SVG',
    },
  },
} as const;

export function getToolUiLocale(pathname: string): ToolUiLocale {
  return pathname.startsWith('/ar') ? 'ar' : 'en';
}
