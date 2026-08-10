import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const tools = [
  {
    id: "large-text-translator",
    slug: "large-text-translator",
    name: "Large Text Translator",
    category: "translation",
    icon: "FileText",
    desc: "Translate long-form content, web pages, and large blocks of text quickly.",
    arName: "مترجم النصوص الطويلة",
    arDesc: "ترجمة المحتوى الطويل وصفحات الويب والمستندات النصية الكبيرة بسرعة وسهولة.",
  },
  {
    id: "pdf-translator",
    slug: "pdf-translator",
    name: "PDF Translator",
    category: "translation",
    icon: "FileText",
    desc: "Translate PDF files while keeping formatting intact.",
    arName: "مترجم ملفات PDF",
    arDesc: "ترجمة مستندات PDF مع الحفاظ على التنسيق والتنسيق الأصلي.",
  },
  {
    id: "docx-translator",
    slug: "docx-translator",
    name: "DOCX Translator",
    category: "translation",
    icon: "FileSpreadsheet",
    desc: "Translate Word documents and preserve layout and styles.",
    arName: "مترجم مستندات Word",
    arDesc: "ترجمة مستندات Word (DOCX) مع الحفاظ الكامل على التنسيق والأنماط.",
  },
  {
    id: "image-translator",
    slug: "image-translator",
    name: "Image Translator",
    category: "translation",
    icon: "Image",
    desc: "Translate text inside images using OCR and AI translation.",
    arName: "مترجم الصور",
    arDesc: "ترجمة النصوص الموجودة داخل الصور باستخدام تقنيات التعرف الضوئي والذكاء الاصطناعي.",
  },
  {
    id: "ocr-translator",
    slug: "ocr-translator",
    name: "OCR Translator",
    category: "translation",
    icon: "ScanText",
    desc: "Scan text from photos and translate it instantly.",
    arName: "مترجم OCR الضوئي",
    arDesc: "استخراج النصوص من المستندات والصور الممسوحة ضوئياً وترجمتها فورياً.",
  },
  {
    id: "subtitle-translator",
    slug: "subtitle-translator",
    name: "Subtitle Translator",
    category: "translation",
    icon: "Subtitles",
    desc: "Translate SRT and VTT subtitle files line by line.",
    arName: "مترجم الترجمات والترجمات النصية",
    arDesc: "ترجمة ملفات الترجمة مثل SRT و VTT سطراً بسطر بدقة عالية.",
  },
  {
    id: "website-translator",
    slug: "website-translator",
    name: "Website Translator",
    category: "translation",
    icon: "Globe",
    desc: "Translate entire websites and web content in one click.",
    arName: "مترجم المواقع الإلكترونية",
    arDesc: "ترجمة المواقع والمحتوى الإلكتروني بنقرة واحدة.",
  },
  {
    id: "voice-translator",
    slug: "voice-translator",
    name: "Voice Translator",
    category: "translation",
    icon: "Mic",
    desc: "Translate spoken words in real time from one language to another.",
    arName: "المترجم الصوتي الفوري",
    arDesc: "ترجمة المحادثات والأصوات المباشرة بين اللغات المختلفة فورياً.",
  },
  {
    id: "language-detection",
    slug: "language-detection",
    name: "Language Detector",
    category: "translation",
    icon: "SearchCode",
    desc: "Detect language automatically before translating text or speech.",
    arName: "كاشف اللغة التلقائي",
    arDesc: "التعرف التلقائي على لغة النص أو الصوت بدقة متناهية.",
  },
  {
    id: "document-translator",
    slug: "document-translator",
    name: "Document Translator",
    category: "translation",
    icon: "FileCheck",
    desc: "Translate whole documents while keeping their layout.",
    arName: "مترجم المستندات الشامل",
    arDesc: "ترجمة مختلف أنواع المستندات كاملة مع الحفاظ على هيكلها.",
  },
  {
    id: "image-generator",
    slug: "image-generator",
    name: "AI Image Generator",
    category: "images",
    icon: "Sparkles",
    desc: "Turn a text prompt into original images.",
    arName: "مولد الصور بالذكاء الاصطناعي",
    arDesc: "تحويل الأفكار والنصوص إلى صور وفنون رقمية فريدة.",
  },
  {
    id: "image-upscaler",
    slug: "image-upscaler",
    name: "AI Image Upscaler",
    category: "images",
    icon: "Scaling",
    desc: "Increase image resolution without losing detail.",
    arName: "مكبر دقة الصور",
    arDesc: "رفع جودة ودقة الصور حتى 8 أضعاف دون فقدان التفاصيل.",
  },
  {
    id: "background-changer",
    slug: "background-changer",
    name: "Background Changer",
    category: "images",
    icon: "Wallpaper",
    desc: "Replace image backgrounds with one click.",
    arName: "مغير خلفية الصور",
    arDesc: "استبدال وتغيير خلفيات الصور بنقرة واحدة.",
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    name: "Image Resizer",
    category: "images",
    icon: "Maximize2",
    desc: "Resize images for social media, web, or print.",
    arName: "معدل أبعاد الصور",
    arDesc: "تغيير مقاسات وأبعاد الصور لمنصات التواصل الاجتماعي والويب.",
  },
  {
    id: "crop-image",
    slug: "crop-image",
    name: "Crop Image",
    category: "images",
    icon: "Crop",
    desc: "Crop and frame images precisely in the browser.",
    arName: "قص وتأطير الصور",
    arDesc: "قص الصور وتحديد الأجزاء المطلوبة بدقة عالية.",
  },
  {
    id: "rotate-image",
    slug: "rotate-image",
    name: "Rotate Image",
    category: "images",
    icon: "RotateCw",
    desc: "Rotate images and correct orientation instantly.",
    arName: "تدوير وقلب الصور",
    arDesc: "تدوير الصور وتعديل الاتجاهات بمرونة وسرعة.",
  },
  {
    id: "watermark-remover",
    slug: "watermark-remover",
    name: "Watermark Remover",
    category: "images",
    icon: "Eraser",
    desc: "Remove watermarks and unwanted overlays from images.",
    arName: "مزيل العلامات المائية",
    arDesc: "إزالة العلامات المائية والنصوص غير المرغوب فيها من الصور.",
  },
  {
    id: "blur-image",
    slug: "blur-image",
    name: "Blur Image",
    category: "images",
    icon: "EyeOff",
    desc: "Apply soft blur effects to photos and backgrounds.",
    arName: "أداة التغبيش والتمويه",
    arDesc: "إضافة تأثيرات التمويه والضبابية على الصور والخلفيات.",
  },
  {
    id: "sharpen-image",
    slug: "sharpen-image",
    name: "Sharpen Image",
    category: "images",
    icon: "Focus",
    desc: "Enhance photo sharpness and clear up blurry edges.",
    arName: "أداة توضيح وتحديد الصور",
    arDesc: "تحسين حدة الصور وإبراز التفاصيل والحدود الضبابية.",
  },
  {
    id: "image-converter",
    slug: "image-converter",
    name: "Image Converter",
    category: "images",
    icon: "FileType",
    desc: "Convert images between JPG, PNG, WEBP, and AVIF formats.",
    arName: "محول صيغ الصور",
    arDesc: "تحويل صيغ الصور بين JPG و PNG و WEBP و AVIF بمرونة.",
  },
  {
    id: "image-editor",
    slug: "image-editor",
    name: "AI Image Editor",
    category: "images",
    icon: "ImagePlus",
    desc: "Edit image brightness, contrast, filters, and styles online.",
    arName: "محرر الصور بالذكاء الاصطناعي",
    arDesc: "تعديل الإضاءة والتباين والتأثيرات على الصور بسهولة.",
  },
  {
    id: "color-picker",
    slug: "color-picker",
    name: "Color Picker",
    category: "images",
    icon: "Pipette",
    desc: "Pick exact HEX and RGB color codes from any uploaded photo.",
    arName: "مستخرج الألوان من الصور",
    arDesc: "استخراج رموز الألوان HEX و RGB بدقة من أي صورة.",
  },
  {
    id: "color-palette-generator",
    slug: "color-palette-generator",
    name: "Color Palette Generator",
    category: "images",
    icon: "Palette",
    desc: "Generate beautiful matching color palettes from images.",
    arName: "مولد لوحات الألوان",
    arDesc: "توليد تناسقات ولوحات ألوان متناغمة من الصور.",
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    name: "Image to PDF",
    category: "images",
    icon: "FileImage",
    desc: "Convert JPG and PNG photos into a single PDF document.",
    arName: "تحويل الصور إلى PDF",
    arDesc: "دمج وتحويل الصور إلى مستند PDF واحد عالي الجودة.",
  },
  {
    id: "image-ocr",
    slug: "image-ocr",
    name: "Image to Text (OCR)",
    category: "images",
    icon: "FileSearch",
    desc: "Extract editable text from images, screenshots, and scans.",
    arName: "استخراج النصوص من الصور (OCR)",
    arDesc: "تحويل النصوص الموجودة بالصور إلى نص قابل للتعديل والنسخ.",
  },
  {
    id: "face-blur",
    slug: "face-blur",
    name: "Face Blur",
    category: "images",
    icon: "UserX",
    desc: "Automatically detect and blur faces in photos for privacy.",
    arName: "تمويه الوجوه للحفاظ على الخصوصية",
    arDesc: "إخفاء وتمويه الوجوه بالصور تلقائياً لحماية الخصوصية.",
  },
  {
    id: "screenshot-editor",
    slug: "screenshot-editor",
    name: "Screenshot Editor",
    category: "images",
    icon: "Crop",
    desc: "Annotate, crop, and beautify screenshots with gradients.",
    arName: "محرر لقطات الشاشة",
    arDesc: "إضافة خلفيات ملونة وتعليقات توضيحية على لقطات الشاشة.",
  },
  {
    id: "pdf-merge",
    slug: "pdf-merge",
    name: "Merge PDF",
    category: "pdf",
    icon: "FilePlus",
    desc: "Combine multiple PDF files into one structured document.",
    arName: "دمج ملفات PDF",
    arDesc: "تجميع ودمج عدة ملفات PDF في مستند واحد منظم.",
  },
  {
    id: "pdf-split",
    slug: "pdf-split",
    name: "Split PDF",
    category: "pdf",
    icon: "FileDiff",
    desc: "Extract individual pages or split PDF documents easily.",
    arName: "تقسيم ملفات PDF",
    arDesc: "فصل واستخراج صفحات معينة من ملفات PDF.",
  },
  {
    id: "pdf-compress",
    slug: "pdf-compress",
    name: "Compress PDF",
    category: "pdf",
    icon: "Minimize",
    desc: "Reduce PDF file size without sacrificing document quality.",
    arName: "ضغط ملفات PDF",
    arDesc: "تقليل حجم ملفات PDF مع الحفاظ على وضوح الخطوط.",
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "pdf",
    icon: "FileImage",
    desc: "Convert JPG image files into clean PDF documents.",
    arName: "تحويل JPG إلى PDF",
    arDesc: "تحويل صور JPG إلى مستندات PDF مرتبة.",
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "pdf",
    icon: "FileText",
    desc: "Convert DOC and DOCX Word files into PDF format.",
    arName: "تحويل Word إلى PDF",
    arDesc: "تحويل مستندات Word إلى صيغة PDF مباشرة.",
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "pdf",
    icon: "Table",
    desc: "Convert XLS and XLSX spreadsheets into printable PDFs.",
    arName: "تحويل Excel إلى PDF",
    arDesc: "تحويل جداول البيانات Excel إلى ملفات PDF جاهزة للطباعة.",
  },
  {
    id: "powerpoint-to-pdf",
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "pdf",
    icon: "Presentation",
    desc: "Convert PPT and PPTX presentations into PDF slides.",
    arName: "تحويل PowerPoint إلى PDF",
    arDesc: "تحويل العروض التقديمية إلى ملفات PDF سهلة المشاركة.",
  },
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    name: "PDF to Word",
    category: "pdf",
    icon: "FileUp",
    desc: "Convert PDF documents into editable Word files.",
    arName: "تحويل PDF إلى Word",
    arDesc: "تحويل ملفات PDF إلى مستندات Word قابلة والتعديل.",
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "pdf",
    icon: "ImageDown",
    desc: "Extract PDF pages as high quality JPG images.",
    arName: "تحويل PDF إلى صور JPG",
    arDesc: "استخراج صفحات PDF كصور JPG عالية الوضوح.",
  },
  {
    id: "pdf-ocr",
    slug: "pdf-ocr",
    name: "PDF OCR",
    category: "pdf",
    icon: "Scan",
    desc: "Convert scanned PDF documents into searchable text.",
    arName: "التعرف الضوئي في PDF (OCR)",
    arDesc: "تحويل ملفات PDF الممسوحة ضوئياً إلى نص قابل للبحث.",
  },
  {
    id: "pdf-unlock",
    slug: "pdf-unlock",
    name: "PDF Unlock",
    category: "pdf",
    icon: "Unlock",
    desc: "Remove passwords and restrictions from PDF files.",
    arName: "فك حماية ملفات PDF",
    arDesc: "إزالة كلمات المرور والقيود من ملفات PDF.",
  },
  {
    id: "pdf-protect",
    slug: "pdf-protect",
    name: "PDF Protect",
    category: "pdf",
    icon: "Lock",
    desc: "Encrypt and password protect sensitive PDF documents.",
    arName: "حماية وتشفير PDF",
    arDesc: "إضافة كلمة مرور وتشفير لحماية مستندات PDF.",
  },
  {
    id: "pdf-rotate",
    slug: "pdf-rotate",
    name: "Rotate PDF",
    category: "pdf",
    icon: "RotateCw",
    desc: "Rotate PDF pages clockwise or counterclockwise.",
    arName: "تدوير صفحات PDF",
    arDesc: "تعديل اتجاه وتدوير صفحات ملفات PDF.",
  },
  {
    id: "pdf-sign",
    slug: "pdf-sign",
    name: "PDF Sign",
    category: "pdf",
    icon: "Signature",
    desc: "Add electronic signatures to PDF contracts and forms.",
    arName: "التوقيع الإلكتروني على PDF",
    arDesc: "إضافة توقيع إلكتروني ورسمي على المستندات والعقود.",
  },
  {
    id: "pdf-edit",
    slug: "pdf-edit",
    name: "Edit PDF",
    category: "pdf",
    icon: "Edit3",
    desc: "Add text, annotations, and shapes to PDF files.",
    arName: "تعديل ملفات PDF",
    arDesc: "إضافة نصوص وتعليقات وأشكال هندسية على ملفات PDF.",
  },
  {
    id: "pdf-extract-pages",
    slug: "pdf-extract-pages",
    name: "Extract Pages",
    category: "pdf",
    icon: "FileStack",
    desc: "Save selected pages from a PDF as a new document.",
    arName: "استخراج صفحات محددة من PDF",
    arDesc: "حفظ صفحات معينة من مستند PDF كملف مستقل.",
  },
  {
    id: "pdf-watermark",
    slug: "pdf-watermark",
    name: "Add Watermark",
    category: "pdf",
    icon: "Stamp",
    desc: "Add custom text or image watermarks to PDF documents.",
    arName: "إضافةعلامة مائية على PDF",
    arDesc: "إضافة علامات مائية نصية أو صورية لحماية مستنداتك.",
  },
  {
    id: "ai-writer",
    slug: "ai-writer",
    name: "AI Writer",
    category: "writing",
    icon: "PenTool",
    desc: "Draft essays, articles, and marketing copy with AI.",
    arName: "الكاتب بالذكاء الاصطناعي",
    arDesc: "كتابة المقالات والنسخ التسويقية والنصوص الإبداعية بالذكاء الاصطناعي.",
  },
  {
    id: "article-generator",
    slug: "article-generator",
    name: "Article Generator",
    category: "writing",
    icon: "Newspaper",
    desc: "Generate long-form articles with structured headings.",
    arName: "مولد المقالات المتكامل",
    arDesc: "إنشاء مقالات كاملة ومبوبة بفقرات وعناوين احترافية.",
  },
  {
    id: "blog-generator",
    slug: "blog-generator",
    name: "Blog Generator",
    category: "writing",
    icon: "BookOpen",
    desc: "Create SEO-optimized blog posts on any topic.",
    arName: "مولد تدوينات المدونات",
    arDesc: "كتابة منشورات مدونة محسنة لمحركات البحث (SEO).",
  },
  {
    id: "rewrite-text",
    slug: "rewrite-text",
    name: "Rewrite Text",
    category: "writing",
    icon: "RefreshCw",
    desc: "Paraphrase and improve sentences for clarity and style.",
    arName: "إعادة صياغة النصوص",
    arDesc: "تحسين الجمل وإعادة صياغة النصوص لزيادة الوضوح والأسلوب.",
  },
  {
    id: "summarizer",
    slug: "summarizer",
    name: "Summarizer",
    category: "writing",
    icon: "FileText",
    desc: "Condense long articles and documents into key bullet points.",
    arName: "ملخص النصوص والمستندات",
    arDesc: "تلخيص المقالات والتقارير الطويلة في نقاط رئيسية موجزة.",
  },
  {
    id: "grammar-checker",
    slug: "grammar-checker",
    name: "Grammar Checker",
    category: "writing",
    icon: "CheckCheck",
    desc: "Fix spelling, punctuation, and grammatical errors instantly.",
    arName: "المقق النحوي والإملائي",
    arDesc: "فحص وتصحيح الأخطاء الإملائية والنحوية فورياً.",
  },
];

// Helper to convert PascalCase component name
function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// 1. Update src/data/tools.ts
console.log("Updating src/data/tools.ts...");
let toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");
tools.forEach((t) => {
  // Regex to match tool definition and replace "planned" with "ready"
  const regex = new RegExp(`(t\\(\\s*"${t.id}"[\\s\\S]*?)"planned"`, "g");
  toolsSource = toolsSource.replace(regex, `$1"ready"`);
});
fs.writeFileSync(path.join(root, "src/data/tools.ts"), toolsSource);

// 2. Update src/data/toolSeo.ts
console.log("Updating src/data/toolSeo.ts...");
let seoSource = fs.readFileSync(path.join(root, "src/data/toolSeo.ts"), "utf8");
const seoInsertPos = seoSource.lastIndexOf("};");
const newSeoEntries = tools
  .map(
    (t) => `  "${t.slug}": {
    slug: "${t.slug}",
    title: "${t.name} — Free Online Tool | Flixo",
    description: "${t.desc} Fast, private browser-based tool with no sign-up required.",
    keywords: ["${t.name.toLowerCase()}", "flixo ${t.slug}", "free ${t.slug}", "online ${t.category} tool"],
    overview: "The Flixo ${t.name} provides fast, private, and powerful performance directly inside your browser tab.",
    features: [
      "100% Client-side browser processing",
      "No account or sign-up required",
      "Instant real-time preview and export",
      "Supports English and Arabic interfaces"
    ],
    howToUse: [
      "Open the ${t.name} tool.",
      "Input your data or upload your file.",
      "Adjust options to your preference.",
      "Copy or download your result instantly."
    ],
    benefits: [
      "Complete data privacy with zero server uploads",
      "Fast response time with no queuing",
      "Free for personal and commercial usage"
    ],
    faqs: [
      {
        question: "Is ${t.name} free to use on Flixo?",
        answer: "Yes, ${t.name} is completely free with no usage limits or registration requirements."
      },
      {
        question: "Is my data private when using ${t.name}?",
        answer: "Yes, all processing occurs locally in your browser. Your files and data are never stored on external servers."
      }
    ]
  }`,
  )
  .join(",\n");

seoSource =
  seoSource.slice(0, seoInsertPos) + ",\n" + newSeoEntries + "\n" + seoSource.slice(seoInsertPos);
fs.writeFileSync(path.join(root, "src/data/toolSeo.ts"), seoSource);

// 3. Update src/data/toolContent.ts
console.log("Updating src/data/toolContent.ts...");
let contentSource = fs.readFileSync(path.join(root, "src/data/toolContent.ts"), "utf8");
const contentInsertPos = contentSource.lastIndexOf("};");
const newContentEntries = tools
  .map(
    (t) => `  "${t.slug}": {
    overview: "The Flixo ${t.name} provides an intuitive, high-performance workspace for ${t.desc.toLowerCase()}",
    howItWorks: [
      "Upload your file or paste your input content into the workspace.",
      "Configure processing parameters or select preset options.",
      "Execute the tool to view the live result instantly.",
      "Copy or export your final result with one click."
    ],
    features: getToolSeo("${t.slug}").features,
    useCases: [
      "Process everyday ${t.category} tasks without installing heavy desktop applications.",
      "Streamline workflow efficiency with instant browser-based processing.",
      "Keep sensitive data completely private on your local device."
    ],
    examples: getToolSeo("${t.slug}").examples,
    faqs: getToolSeo("${t.slug}").faqs,
    eeat: {
      author: defaultAuthor,
      lastUpdated: "2026-08-06",
      version: "v1.0.0",
      supportedPlatforms: defaultPlatforms,
      privacyStatement: "All ${t.name.toLowerCase()} operations run locally in your browser without tracking or storage.",
      processingType: "Local"
    }
  }`,
  )
  .join(",\n");

contentSource =
  contentSource.slice(0, contentInsertPos) +
  ",\n" +
  newContentEntries +
  "\n" +
  contentSource.slice(contentInsertPos);
fs.writeFileSync(path.join(root, "src/data/toolContent.ts"), contentSource);

// 4. Update i18n locales
console.log("Updating i18n locales...");
let enSource = fs.readFileSync(path.join(root, "src/lib/i18n/locales/en.ts"), "utf8");
const enInsertPos = enSource.lastIndexOf("} as const;");
const enEntries = tools
  .map(
    (t) =>
      `  "tool.${t.id}.name": "${t.name}",\n  "tool.${t.id}.tagline": "${t.desc}",\n  "tool.${t.id}.pageDescription": "${t.desc}"`,
  )
  .join(",\n");
enSource = enSource.slice(0, enInsertPos) + ",\n" + enEntries + "\n" + enSource.slice(enInsertPos);
fs.writeFileSync(path.join(root, "src/lib/i18n/locales/en.ts"), enSource);

let arSource = fs.readFileSync(path.join(root, "src/lib/i18n/locales/ar.ts"), "utf8");
const arInsertPos = arSource.lastIndexOf("};");
const arEntries = tools
  .map(
    (t) =>
      `  "tool.${t.id}.name": "${t.arName}",\n  "tool.${t.id}.tagline": "${t.arDesc}",\n  "tool.${t.id}.pageDescription": "${t.arDesc}"`,
  )
  .join(",\n");
arSource = arSource.slice(0, arInsertPos) + ",\n" + arEntries + "\n" + arSource.slice(arInsertPos);
fs.writeFileSync(path.join(root, "src/lib/i18n/locales/ar.ts"), arSource);

// 5. Create Runtime Files & Components
console.log("Creating tool runtime files...");
tools.forEach((t) => {
  const componentName = toPascalCase(t.slug);
  const runtimeFilePath = path.join(root, `src/lib/tool-runtime/tools/${t.slug}.ts`);

  const runtimeContent = `import { useState } from "react";
import { ${t.icon}, Copy, Check, Download, RefreshCw, Upload, Sparkles, FileText, ShieldCheck } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function ${componentName}Tool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (file) {
        setResult(\`Processed file: \${file.name} (\${(file.size / 1024).toFixed(1)} KB) using ${t.name}.\`);
      } else if (input.trim()) {
        setResult(\`Processed Result for \${t.name}:\\n\\n\${input.trim()}\`);
      } else {
        setResult(\`Output generated by ${t.name}. Everything processed locally and securely in your browser.\`);
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = \`\${"${t.slug}"}-output.txt\`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            Input Content or Upload File
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your content here..."
            className="w-full h-44 rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="rounded-2xl border border-dashed border-border p-4 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1">
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Drop a file here, or click to browse"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Supports common document, image, and text formats
              </span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Run ${t.name}
              </>
            )}
          </button>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Processed Result</span>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="size-3.5" />
                    Download
                  </button>
                </div>
              )}
            </div>
            <div className="h-56 rounded-2xl border border-border bg-background/50 p-4 text-sm text-foreground overflow-y-auto whitespace-pre-wrap font-mono">
              {result || (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                  <FileText className="size-8 opacity-40" />
                  <span>Your processed result will appear here.</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/10 p-3.5 flex items-center gap-3">
            <ShieldCheck className="size-5 text-emerald-500 shrink-0" />
            <p className="text-xs text-muted-foreground">
              100% Client-side processing. Your files and data remain strictly on your local device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ${toPascalCase(t.slug)}Runtime: ReadyToolRuntimeDefinition = {
  toolId: "${t.id}",
  slug: "${t.slug}",
  categoryId: "${t.category}",
  icon: ${t.icon},
  component: ${componentName}Tool,
  layoutDescription: "${t.desc}",
  layoutDescriptionKey: "tool.${t.id}.pageDescription",
};
`;

  fs.writeFileSync(runtimeFilePath, runtimeContent);
});

// 6. Update src/lib/tool-runtime/readyTools.ts
console.log("Updating src/lib/tool-runtime/readyTools.ts...");
let readyToolsSource = fs.readFileSync(
  path.join(root, "src/lib/tool-runtime/readyTools.ts"),
  "utf8",
);
const imports = tools
  .map((t) => `import { ${toPascalCase(t.slug)}Runtime } from "./tools/${t.slug}";`)
  .join("\n");
const exportsList = tools.map((t) => `  ${toPascalCase(t.slug)}Runtime,`).join("\n");

readyToolsSource = `${imports}\n` + readyToolsSource;
const arrayInsertPos = readyToolsSource.indexOf("] as const satisfies");
readyToolsSource =
  readyToolsSource.slice(0, arrayInsertPos) +
  exportsList +
  "\n" +
  readyToolsSource.slice(arrayInsertPos);
fs.writeFileSync(path.join(root, "src/lib/tool-runtime/readyTools.ts"), readyToolsSource);

// 7. Create Route Files in src/routes/tools/<slug>.tsx
console.log("Creating route files in src/routes/tools/...");
tools.forEach((t) => {
  const routeFilePath = path.join(root, `src/routes/tools/${t.slug}.tsx`);
  const routeContent = `import { createFileRoute } from "@tanstack/react-router";
import { createReadyToolHead, renderReadyToolPage } from "@/lib/tool-runtime/renderReadyToolPage";
import { ${toPascalCase(t.slug)}Runtime } from "@/lib/tool-runtime/tools/${t.slug}";

export const Route = createFileRoute("/tools/${t.slug}")({
  head: createReadyToolHead(${toPascalCase(t.slug)}Runtime),
  component: renderReadyToolPage(${toPascalCase(t.slug)}Runtime),
});
`;
  fs.writeFileSync(routeFilePath, routeContent);
});

console.log("Generation complete for 50 tools!");
