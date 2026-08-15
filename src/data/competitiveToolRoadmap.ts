export type CompetitivePriority = "core" | "high" | "strategic";

export interface CompetitiveToolCandidate {
  slug: string;
  name: string;
  category: string;
  priority: CompetitivePriority;
  purpose: string;
}

/**
 * Master capability map for product coverage.
 * These are roadmap targets, not claims that every capability is implemented.
 * Public search and public routes remain governed by the real tool registry.
 */
export const competitiveToolRoadmap = [
  // PDF & Documents
  [
    ["pdf-merge", "Merge PDF", "PDF", "core", "Combine multiple PDFs into one."],
    ["pdf-split", "Split PDF", "PDF", "core", "Split or extract selected pages."],
    ["pdf-compress", "Compress PDF", "PDF", "core", "Reduce PDF size for sharing."],
    ["pdf-rotate", "Rotate PDF", "PDF", "core", "Rotate pages and fix orientation."],
    ["pdf-protect", "Protect PDF", "PDF", "high", "Password-protect a PDF."],
    ["pdf-unlock", "Unlock PDF", "PDF", "high", "Remove a password from a PDF you own."],
    ["pdf-sign", "Sign PDF", "PDF", "high", "Add an electronic signature."],
    ["pdf-edit", "Edit PDF", "PDF", "strategic", "Edit text and visual elements in PDFs."],
    ["pdf-ocr", "PDF OCR", "PDF", "high", "Extract text from scanned PDFs."],
    ["pdf-to-word", "PDF to Word", "PDF", "core", "Convert suitable PDFs to DOCX."],
    ["pdf-to-jpg", "PDF to JPG", "PDF", "core", "Render PDF pages as images."],
    ["jpg-to-pdf", "JPG to PDF", "PDF", "core", "Create PDFs from images."],
    ["word-to-pdf", "Word to PDF", "PDF", "high", "Convert DOCX documents to PDF."],
    ["excel-to-pdf", "Excel to PDF", "PDF", "high", "Convert spreadsheets to PDF."],
    ["powerpoint-to-pdf", "PowerPoint to PDF", "PDF", "high", "Convert slides to PDF."],
    ["pdf-watermark", "PDF Watermark", "PDF", "high", "Stamp PDFs with a watermark."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Images
  [
    ["image-resizer", "Image Resizer", "Images", "core", "Resize for web, social and print."],
    ["crop-image", "Image Cropper", "Images", "core", "Crop and frame images."],
    ["rotate-image", "Rotate Image", "Images", "core", "Rotate and correct orientation."],
    ["image-converter", "Image Converter", "Images", "core", "Convert common image formats."],
    ["image-upscaler", "Image Upscaler", "Images", "high", "Increase resolution while preserving detail."],
    ["background-changer", "Background Changer", "Images", "high", "Replace an image background."],
    ["image-editor", "AI Image Editor", "Images", "strategic", "Retouch and modify images with AI."],
    ["image-ocr", "Image to Text", "Images", "high", "Extract text from photos and scans."],
    ["face-blur", "Face Blur", "Images", "high", "Blur faces for privacy."],
    ["screenshot-editor", "Screenshot Editor", "Images", "high", "Annotate and crop screenshots."],
    ["color-picker", "Color Picker", "Images", "high", "Pick colors and build palettes."],
    ["watermark-remover", "Watermark Remover", "Images", "strategic", "Remove unwanted overlays from owned content."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Video
  [
    ["merge-video", "Merge Video", "Video", "core", "Combine multiple clips."],
    ["convert-video", "Convert Video", "Video", "core", "Convert common video formats."],
    ["extract-audio", "Extract Audio", "Video", "core", "Extract an audio track from video."],
    ["video-crop", "Crop Video", "Video", "high", "Crop the visible video frame."],
    ["video-rotate", "Rotate Video", "Video", "high", "Rotate video orientation."],
    ["video-speed", "Video Speed", "Video", "core", "Change playback speed."],
    ["video-mute", "Mute Video", "Video", "core", "Remove or mute the audio track."],
    ["video-frame-extractor", "Extract Video Frame", "Video", "high", "Export a frame as an image."],
    ["subtitle-editor", "Subtitle Editor", "Video", "high", "Create and edit subtitles."],
    ["auto-subtitles", "Auto Subtitles", "Video", "strategic", "Generate captions from speech."],
    ["video-background-remover", "Video Background Remover", "Video", "strategic", "Remove video backgrounds."],
    ["video-enhancer", "Video Enhancer", "Video", "strategic", "Improve video quality."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Audio
  [
    ["mp3-converter", "Audio Converter", "Audio", "core", "Convert common audio formats."],
    ["audio-cutter", "Audio Cutter", "Audio", "core", "Trim audio segments."],
    ["audio-joiner", "Audio Joiner", "Audio", "high", "Combine multiple audio files."],
    ["audio-normalizer", "Audio Normalizer", "Audio", "high", "Normalize playback level."],
    ["noise-remover", "Noise Remover", "Audio", "high", "Reduce background noise."],
    ["voice-recorder", "Voice Recorder", "Audio", "high", "Record browser audio."],
    ["speech-to-text", "Speech to Text", "Audio", "high", "Transcribe spoken audio."],
    ["audio-transcriber", "Audio Transcriber", "Audio", "high", "Create text from audio files."],
    ["voice-changer", "Voice Changer", "Audio", "strategic", "Transform voice characteristics."],
    ["audio-to-video", "Audio to Video", "Audio", "high", "Create video from audio and artwork."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // AI & Productivity
  [
    ["ai-chat", "AI Chat", "AI", "core", "General-purpose AI assistance."],
    ["ai-writer", "AI Writer", "AI", "high", "Draft and rewrite content."],
    ["summarizer", "AI Summarizer", "AI", "core", "Summarize long content."],
    ["ai-code-assistant", "AI Code Assistant", "AI", "strategic", "Explain and generate code."],
    ["ai-document-analyzer", "AI Document Analyzer", "AI", "high", "Extract insights from documents."],
    ["ai-meeting-summary", "Meeting Summarizer", "AI", "high", "Summarize transcripts and actions."],
    ["ai-resume-builder", "AI Resume Builder", "AI", "high", "Create resumes from experience."],
    ["ai-presentation-creator", "AI Presentation Creator", "AI", "strategic", "Create presentation outlines and slides."],
    ["prompt-improver", "Prompt Improver", "AI", "high", "Improve prompts for AI systems."],
    ["ai-translation", "AI Translation", "AI", "core", "Translate text naturally across languages."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Developer
  [
    ["api-tester", "API Tester", "Developer", "core", "Send requests and inspect responses."],
    ["json-formatter", "JSON Formatter", "Developer", "core", "Format and minify JSON."],
    ["json-validator", "JSON Validator", "Developer", "core", "Validate JSON syntax."],
    ["yaml-formatter", "YAML Formatter", "Developer", "high", "Format and validate YAML."],
    ["xml-formatter", "XML Formatter", "Developer", "high", "Format XML."],
    ["regex-tester", "Regex Tester", "Developer", "core", "Test regular expressions."],
    ["jwt-decoder", "JWT Decoder", "Developer", "high", "Inspect JWT headers and payloads."],
    ["sql-formatter", "SQL Formatter", "Developer", "core", "Format SQL queries."],
    ["markdown-preview", "Markdown Preview", "Developer", "core", "Preview Markdown instantly."],
    ["cron-parser", "Cron Parser", "Developer", "high", "Explain cron expressions."],
    ["api-doc-generator", "API Docs Generator", "Developer", "strategic", "Generate API documentation."],
    ["code-diff", "Code Diff", "Developer", "high", "Compare code revisions."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Web & SEO
  [
    ["meta-tag-generator", "Meta Tag Generator", "Web & SEO", "core", "Generate SEO metadata."],
    ["open-graph-generator", "Open Graph Generator", "Web & SEO", "high", "Create social preview metadata."],
    ["robots-txt-generator", "Robots.txt Generator", "Web & SEO", "high", "Generate crawler rules."],
    ["sitemap-generator", "Sitemap Generator", "Web & SEO", "high", "Build XML sitemaps."],
    ["website-screenshot", "Website Screenshot", "Web & SEO", "high", "Capture a page image."],
    ["url-encoder", "URL Encoder", "Web & SEO", "core", "Encode URL components."],
    ["url-decoder", "URL Decoder", "Web & SEO", "core", "Decode URL components."],
    ["redirect-checker", "Redirect Checker", "Web & SEO", "high", "Inspect redirect chains."],
    ["dns-checker", "DNS Checker", "Web & SEO", "high", "Inspect DNS records."],
    ["http-headers", "HTTP Headers Inspector", "Web & SEO", "high", "Inspect response headers."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Files & Data
  [
    ["zip-creator", "ZIP Creator", "Files", "core", "Create ZIP archives."],
    ["archive-extractor", "Archive Extractor", "Files", "high", "Extract supported archives."],
    ["file-hash-generator", "File Hash Generator", "Files", "core", "Generate file checksums."],
    ["file-compressor", "File Compressor", "Files", "high", "Compress files into archives."],
    ["file-splitter", "File Splitter", "Files", "high", "Split large files into chunks."],
    ["duplicate-finder", "Duplicate Finder", "Files", "high", "Find duplicate files."],
    ["csv-viewer", "CSV Viewer", "Data", "core", "Preview CSV files as tables."],
    ["csv-to-json", "CSV to JSON", "Data", "core", "Convert tabular data to JSON."],
    ["json-to-csv", "JSON to CSV", "Data", "high", "Convert JSON arrays to CSV."],
    ["excel-viewer", "Excel Viewer", "Data", "high", "Preview spreadsheets in the browser."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Everyday Utilities
  [
    ["word-counter", "Word Counter", "Utilities", "core", "Count words and reading time."],
    ["character-counter", "Character Counter", "Utilities", "core", "Count characters and symbols."],
    ["text-cleaner", "Text Cleaner", "Utilities", "core", "Clean whitespace and line breaks."],
    ["find-and-replace", "Find and Replace", "Utilities", "core", "Transform large text quickly."],
    ["remove-duplicate-lines", "Remove Duplicate Lines", "Utilities", "core", "Deduplicate text lines."],
    ["sort-lines", "Sort Lines", "Utilities", "core", "Sort text lines."],
    ["reverse-text", "Reverse Text", "Utilities", "high", "Reverse text by mode."],
    ["add-line-numbers", "Add Line Numbers", "Utilities", "high", "Number text lines."],
    ["password-generator", "Password Generator", "Utilities", "core", "Generate strong passwords."],
    ["qr-generator", "QR Generator", "Utilities", "core", "Generate QR codes."],
    ["qr-reader", "QR Reader", "Utilities", "high", "Decode QR images."],
    ["barcode-generator", "Barcode Generator", "Utilities", "high", "Generate barcodes."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),

  // Calculators & Converters
  [
    ["standard-calculator", "Calculator", "Calculators", "core", "Everyday arithmetic."],
    ["scientific-calculator", "Scientific Calculator", "Calculators", "high", "Advanced math."],
    ["percentage-calculator", "Percentage Calculator", "Calculators", "core", "Percentages and change."],
    ["discount-calculator", "Discount Calculator", "Calculators", "high", "Sale price calculations."],
    ["vat-calculator", "VAT Calculator", "Calculators", "high", "Tax-inclusive calculations."],
    ["loan-calculator", "Loan Calculator", "Calculators", "high", "Payment and interest estimates."],
    ["age-calculator", "Age Calculator", "Calculators", "core", "Age and date difference."],
    ["date-calculator", "Date Calculator", "Calculators", "high", "Date arithmetic."],
    ["unit-converter", "Unit Converter", "Converters", "core", "Convert common units."],
    ["currency-converter", "Currency Converter", "Converters", "high", "Convert currency amounts."],
    ["time-zone-converter", "Time Zone Converter", "Converters", "high", "Convert times across regions."],
    ["data-storage-converter", "Data Storage Converter", "Converters", "high", "Convert bytes and storage units."],
  ].map(([slug, name, category, priority, purpose]) => ({ slug, name, category, priority, purpose })),
] as const;

export const competitiveToolRoadmapFlat: readonly CompetitiveToolCandidate[] = competitiveToolRoadmap.flat();
