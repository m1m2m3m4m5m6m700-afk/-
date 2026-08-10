import { LargeTextTranslatorRuntime } from "./tools/large-text-translator";
import { PdfTranslatorRuntime } from "./tools/pdf-translator";
import { DocxTranslatorRuntime } from "./tools/docx-translator";
import { ImageTranslatorRuntime } from "./tools/image-translator";
import { OcrTranslatorRuntime } from "./tools/ocr-translator";
import { SubtitleTranslatorRuntime } from "./tools/subtitle-translator";
import { WebsiteTranslatorRuntime } from "./tools/website-translator";
import { VoiceTranslatorRuntime } from "./tools/voice-translator";
import { LanguageDetectionRuntime } from "./tools/language-detection";
import { DocumentTranslatorRuntime } from "./tools/document-translator";
import { ImageGeneratorRuntime } from "./tools/image-generator";
import { ImageUpscalerRuntime } from "./tools/image-upscaler";
import { BackgroundChangerRuntime } from "./tools/background-changer";
import { ImageResizerRuntime } from "./tools/image-resizer";
import { CropImageRuntime } from "./tools/crop-image";
import { RotateImageRuntime } from "./tools/rotate-image";
import { WatermarkRemoverRuntime } from "./tools/watermark-remover";
import { BlurImageRuntime } from "./tools/blur-image";
import { SharpenImageRuntime } from "./tools/sharpen-image";
import { ImageConverterRuntime } from "./tools/image-converter";
import { ImageEditorRuntime } from "./tools/image-editor";
import { ColorPickerRuntime } from "./tools/color-picker";
import { ColorPaletteGeneratorRuntime } from "./tools/color-palette-generator";
import { ImageToPdfRuntime } from "./tools/image-to-pdf";
import { ImageOcrRuntime } from "./tools/image-ocr";
import { FaceBlurRuntime } from "./tools/face-blur";
import { ScreenshotEditorRuntime } from "./tools/screenshot-editor";
import { PdfMergeRuntime } from "./tools/pdf-merge";
import { PdfSplitRuntime } from "./tools/pdf-split";
import { PdfCompressRuntime } from "./tools/pdf-compress";
import { JpgToPdfRuntime } from "./tools/jpg-to-pdf";
import { WordToPdfRuntime } from "./tools/word-to-pdf";
import { ExcelToPdfRuntime } from "./tools/excel-to-pdf";
import { PowerpointToPdfRuntime } from "./tools/powerpoint-to-pdf";
import { PdfToWordRuntime } from "./tools/pdf-to-word";
import { PdfToJpgRuntime } from "./tools/pdf-to-jpg";
import { PdfOcrRuntime } from "./tools/pdf-ocr";
import { PdfUnlockRuntime } from "./tools/pdf-unlock";
import { PdfProtectRuntime } from "./tools/pdf-protect";
import { PdfRotateRuntime } from "./tools/pdf-rotate";
import { PdfSignRuntime } from "./tools/pdf-sign";
import { PdfEditRuntime } from "./tools/pdf-edit";
import { PdfExtractPagesRuntime } from "./tools/pdf-extract-pages";
import { PdfWatermarkRuntime } from "./tools/pdf-watermark";
import { AiWriterRuntime } from "./tools/ai-writer";
import { ArticleGeneratorRuntime } from "./tools/article-generator";
import { BlogGeneratorRuntime } from "./tools/blog-generator";
import { RewriteTextRuntime } from "./tools/rewrite-text";
import { SummarizerRuntime } from "./tools/summarizer";
import { GrammarCheckerRuntime } from "./tools/grammar-checker";
import { WordCounterRuntime } from "./tools/word-counter";
import { JsonFormatterRuntime } from "./tools/json-formatter";
import { LoremIpsumRuntime } from "./tools/lorem-ipsum";
import { CaseConverterRuntime } from "./tools/case-converter";
import { UuidGeneratorRuntime } from "./tools/uuid-generator";
import { BarcodeGeneratorRuntime } from "./tools/barcode-generator";
import { UnitConverterRuntime } from "./tools/unit-converter";
import { PercentageCalculatorRuntime } from "./tools/percentage-calculator";
import { Base64ConverterRuntime } from "./tools/base64-converter";
import { TimestampConverterRuntime } from "./tools/timestamp-converter";
import { UrlEncoderRuntime } from "./tools/url-encoder";
import { HtmlEntityEncoderRuntime } from "./tools/html-entity-encoder";
import { MarkdownPreviewRuntime } from "./tools/markdown-preview";
import { JsonValidatorRuntime } from "./tools/json-validator";
import { RegexTesterRuntime } from "./tools/regex-tester";
import { CsvToJsonRuntime } from "./tools/csv-to-json";
import { HtmlMinifierRuntime } from "./tools/html-minifier";
import { CssMinifierRuntime } from "./tools/css-minifier";
import { JsMinifierRuntime } from "./tools/js-minifier";
import { MetaTagGeneratorRuntime } from "./tools/meta-tag-generator";
import { JwtDecoderRuntime } from "./tools/jwt-decoder";
import { FileHashGeneratorRuntime } from "./tools/file-hash-generator";
import { RemoveDuplicateLinesRuntime } from "./tools/remove-duplicate-lines";
import { RemoveEmptyLinesRuntime } from "./tools/remove-empty-lines";
import { TextCleanerRuntime } from "./tools/text-cleaner";
import { SortLinesRuntime } from "./tools/sort-lines";
import { ReverseTextRuntime } from "./tools/reverse-text";
import { AddLineNumbersRuntime } from "./tools/add-line-numbers";
import { FindAndReplaceRuntime } from "./tools/find-and-replace";
import { WordFrequencyRuntime } from "./tools/word-frequency";
import { TextCompareRuntime } from "./tools/text-compare";
import { XmlFormatterRuntime } from "./tools/xml-formatter";
import { XmlValidatorRuntime } from "./tools/xml-validator";
import { HtmlFormatterRuntime } from "./tools/html-formatter";
import { SqlFormatterRuntime } from "./tools/sql-formatter";
import { YamlFormatterRuntime } from "./tools/yaml-formatter";
import { MarkdownTableGeneratorRuntime } from "./tools/markdown-table-generator";
import { CronParserRuntime } from "./tools/cron-parser";
import { CssGradientGeneratorRuntime } from "./tools/css-gradient-generator";
import { RandomNameRuntime } from "./tools/random-name";
import { SlugGeneratorRuntime } from "./tools/slug-generator";
import { QrReaderRuntime } from "./tools/qr-reader";
import { PasswordCheckerRuntime } from "./tools/password-checker";
import { CsvViewerRuntime } from "./tools/csv-viewer";
import { backgroundRemoverRuntime } from "./tools/background-remover";
import { imageCompressorRuntime } from "./tools/image-compressor";
import { imageEnhancerRuntime } from "./tools/image-enhancer";
import { passwordGeneratorRuntime } from "./tools/password-generator";
import { qrGeneratorRuntime } from "./tools/qr-generator";
import { translatorRuntime } from "./tools/translator";
import { AudioConverterRuntime } from "./tools/audio-converter";
import { AudioCompressorRuntime } from "./tools/audio-compressor";
import { VideoConverterRuntime } from "./tools/video-converter";
import { VideoCompressorRuntime } from "./tools/video-compressor";
import { VideoTrimmerRuntime } from "./tools/video-trimmer";
import { GifMakerRuntime } from "./tools/gif-maker";
import { GifCompressorRuntime } from "./tools/gif-compressor";
import { AudioCutterRuntime } from "./tools/audio-cutter";
import { VideoToGifRuntime } from "./tools/video-to-gif";
import { ImageToGifRuntime } from "./tools/image-to-gif";
import { PdfToExcelRuntime } from "./tools/pdf-to-excel";
import { PdfToPowerpointRuntime } from "./tools/pdf-to-powerpoint";
import { PdfToTextRuntime } from "./tools/pdf-to-text";
import { PdfCropRuntime } from "./tools/pdf-crop";
import { PdfPageNumbersRuntime } from "./tools/pdf-page-numbers";
import { PdfHeaderFooterRuntime } from "./tools/pdf-header-footer";
import { TextToPdfRuntime } from "./tools/text-to-pdf";
import { TextToWordRuntime } from "./tools/text-to-word";
import { MarkdownToPdfRuntime } from "./tools/markdown-to-pdf";
import { MarkdownToWordRuntime } from "./tools/markdown-to-word";
import { ColorConverterRuntime } from "./tools/color-converter";
import { RandomNumberRuntime } from "./tools/random-number";
import { TemperatureConverterRuntime } from "./tools/temperature-converter";
import { BmiCalculatorRuntime } from "./tools/bmi-calculator";
import { AgeCalculatorRuntime } from "./tools/age-calculator";
import { TextToSpeechRuntime } from "./tools/text-to-speech";
import type { ReadyToolRuntimeDefinition } from "./types";

export const readyToolRuntimes = [
  translatorRuntime,
  imageEnhancerRuntime,
  imageCompressorRuntime,
  backgroundRemoverRuntime,
  passwordGeneratorRuntime,
  qrGeneratorRuntime,
  LargeTextTranslatorRuntime,
  PdfTranslatorRuntime,
  DocxTranslatorRuntime,
  ImageTranslatorRuntime,
  OcrTranslatorRuntime,
  SubtitleTranslatorRuntime,
  WebsiteTranslatorRuntime,
  VoiceTranslatorRuntime,
  LanguageDetectionRuntime,
  DocumentTranslatorRuntime,
  ImageGeneratorRuntime,
  ImageUpscalerRuntime,
  BackgroundChangerRuntime,
  ImageResizerRuntime,
  CropImageRuntime,
  RotateImageRuntime,
  WatermarkRemoverRuntime,
  BlurImageRuntime,
  SharpenImageRuntime,
  ImageConverterRuntime,
  ImageEditorRuntime,
  ColorPickerRuntime,
  ColorPaletteGeneratorRuntime,
  ImageToPdfRuntime,
  ImageOcrRuntime,
  FaceBlurRuntime,
  ScreenshotEditorRuntime,
  PdfMergeRuntime,
  PdfSplitRuntime,
  PdfCompressRuntime,
  JpgToPdfRuntime,
  WordToPdfRuntime,
  ExcelToPdfRuntime,
  PowerpointToPdfRuntime,
  PdfToWordRuntime,
  PdfToJpgRuntime,
  PdfOcrRuntime,
  PdfUnlockRuntime,
  PdfProtectRuntime,
  PdfRotateRuntime,
  PdfSignRuntime,
  PdfEditRuntime,
  PdfExtractPagesRuntime,
  PdfWatermarkRuntime,
  AiWriterRuntime,
  ArticleGeneratorRuntime,
  BlogGeneratorRuntime,
  RewriteTextRuntime,
  SummarizerRuntime,
  GrammarCheckerRuntime,
  WordCounterRuntime,
  JsonFormatterRuntime,
  LoremIpsumRuntime,
  CaseConverterRuntime,
  UuidGeneratorRuntime,
  BarcodeGeneratorRuntime,
  UnitConverterRuntime,
  PercentageCalculatorRuntime,
  Base64ConverterRuntime,
  TimestampConverterRuntime,
  UrlEncoderRuntime,
  HtmlEntityEncoderRuntime,
  MarkdownPreviewRuntime,
  JsonValidatorRuntime,
  RegexTesterRuntime,
  CsvToJsonRuntime,
  HtmlMinifierRuntime,
  CssMinifierRuntime,
  JsMinifierRuntime,
  MetaTagGeneratorRuntime,
  JwtDecoderRuntime,
  FileHashGeneratorRuntime,
  AudioConverterRuntime,
  AudioCompressorRuntime,
  VideoConverterRuntime,
  VideoCompressorRuntime,
  VideoTrimmerRuntime,
  GifMakerRuntime,
  GifCompressorRuntime,
  AudioCutterRuntime,
  VideoToGifRuntime,
  ImageToGifRuntime,
  PdfToExcelRuntime,
  PdfToPowerpointRuntime,
  PdfToTextRuntime,
  PdfCropRuntime,
  PdfPageNumbersRuntime,
  PdfHeaderFooterRuntime,
  TextToPdfRuntime,
  TextToWordRuntime,
  MarkdownToPdfRuntime,
  MarkdownToWordRuntime,
  RemoveDuplicateLinesRuntime,
  RemoveEmptyLinesRuntime,
  TextCleanerRuntime,
  SortLinesRuntime,
  ReverseTextRuntime,
  AddLineNumbersRuntime,
  FindAndReplaceRuntime,
  WordFrequencyRuntime,
  TextCompareRuntime,
  XmlFormatterRuntime,
  XmlValidatorRuntime,
  HtmlFormatterRuntime,
  SqlFormatterRuntime,
  YamlFormatterRuntime,
  MarkdownTableGeneratorRuntime,
  CronParserRuntime,
  CssGradientGeneratorRuntime,
  RandomNameRuntime,
  SlugGeneratorRuntime,
  QrReaderRuntime,
  PasswordCheckerRuntime,
  CsvViewerRuntime,
  ColorConverterRuntime,
  RandomNumberRuntime,
  TemperatureConverterRuntime,
  BmiCalculatorRuntime,
  AgeCalculatorRuntime,
  TextToSpeechRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);
