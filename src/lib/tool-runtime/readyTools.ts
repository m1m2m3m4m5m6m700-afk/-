import { AddLineNumbersRuntime } from "./tools/add-line-numbers";
import { AgeCalculatorRuntime } from "./tools/age-calculator";
import { ArchiveExtractorRuntime } from "./tools/archive-extractor";
import { AudioCompressorRuntime } from "./tools/audio-compressor";
import { AudioConverterRuntime } from "./tools/audio-converter";
import { AudioCutterRuntime } from "./tools/audio-cutter";
import { backgroundRemoverRuntime } from "./tools/background-remover";
import { BarcodeGeneratorRuntime } from "./tools/barcode-generator";
import { Base64ConverterRuntime } from "./tools/base64-converter";
import { BmiCalculatorRuntime } from "./tools/bmi-calculator";
import { CaseConverterRuntime } from "./tools/case-converter";
import { ColorConverterRuntime } from "./tools/color-converter";
import { CronParserRuntime } from "./tools/cron-parser";
import { CssGradientGeneratorRuntime } from "./tools/css-gradient-generator";
import { CssMinifierRuntime } from "./tools/css-minifier";
import { CsvToJsonRuntime } from "./tools/csv-to-json";
import { CsvViewerRuntime } from "./tools/csv-viewer";
import { FileHashGeneratorRuntime } from "./tools/file-hash-generator";
import { FileSplitterRuntime } from "./tools/file-splitter";
import { FindAndReplaceRuntime } from "./tools/find-and-replace";
import { GifCompressorRuntime } from "./tools/gif-compressor";
import { GifMakerRuntime } from "./tools/gif-maker";
import { HtmlEntityEncoderRuntime } from "./tools/html-entity-encoder";
import { HtmlFormatterRuntime } from "./tools/html-formatter";
import { HtmlMinifierRuntime } from "./tools/html-minifier";
import { imageCompressorRuntime } from "./tools/image-compressor";
import { imageEnhancerRuntime } from "./tools/image-enhancer";
import { ImageToGifRuntime } from "./tools/image-to-gif";
import { JsMinifierRuntime } from "./tools/js-minifier";
import { JsonFormatterRuntime } from "./tools/json-formatter";
import { JsonValidatorRuntime } from "./tools/json-validator";
import { JwtDecoderRuntime } from "./tools/jwt-decoder";
import { LoremIpsumRuntime } from "./tools/lorem-ipsum";
import { MarkdownPreviewRuntime } from "./tools/markdown-preview";
import { MarkdownTableGeneratorRuntime } from "./tools/markdown-table-generator";
import { MarkdownToPdfRuntime } from "./tools/markdown-to-pdf";
import { MarkdownToWordRuntime } from "./tools/markdown-to-word";
import { MetaTagGeneratorRuntime } from "./tools/meta-tag-generator";
import { MetadataViewerRuntime } from "./tools/metadata-viewer";
import { PasswordCheckerRuntime } from "./tools/password-checker";
import { passwordGeneratorRuntime } from "./tools/password-generator";
import { PdfCropRuntime } from "./tools/pdf-crop";
import { PdfHeaderFooterRuntime } from "./tools/pdf-header-footer";
import { PdfPageNumbersRuntime } from "./tools/pdf-page-numbers";
import { PdfToExcelRuntime } from "./tools/pdf-to-excel";
import { PdfToPowerpointRuntime } from "./tools/pdf-to-powerpoint";
import { PdfToTextRuntime } from "./tools/pdf-to-text";
import { PercentageCalculatorRuntime } from "./tools/percentage-calculator";
import { qrGeneratorRuntime } from "./tools/qr-generator";
import { QrReaderRuntime } from "./tools/qr-reader";
import { RandomNameRuntime } from "./tools/random-name";
import { RandomNumberRuntime } from "./tools/random-number";
import { RegexTesterRuntime } from "./tools/regex-tester";
import { RemoveDuplicateLinesRuntime } from "./tools/remove-duplicate-lines";
import { RemoveEmptyLinesRuntime } from "./tools/remove-empty-lines";
import { ReverseTextRuntime } from "./tools/reverse-text";
import { SlugGeneratorRuntime } from "./tools/slug-generator";
import { SortLinesRuntime } from "./tools/sort-lines";
import { SqlFormatterRuntime } from "./tools/sql-formatter";
import { TemperatureConverterRuntime } from "./tools/temperature-converter";
import { TextCleanerRuntime } from "./tools/text-cleaner";
import { TextCompareRuntime } from "./tools/text-compare";
import { TextToPdfRuntime } from "./tools/text-to-pdf";
import { TextToSpeechRuntime } from "./tools/text-to-speech";
import { TextToWordRuntime } from "./tools/text-to-word";
import { TimestampConverterRuntime } from "./tools/timestamp-converter";
import { translatorRuntime } from "./tools/translator";
import { UnitConverterRuntime } from "./tools/unit-converter";
import { UrlEncoderRuntime } from "./tools/url-encoder";
import { UuidGeneratorRuntime } from "./tools/uuid-generator";
import { VideoCompressorRuntime } from "./tools/video-compressor";
import { VideoConverterRuntime } from "./tools/video-converter";
import { VideoToGifRuntime } from "./tools/video-to-gif";
import { VideoTrimmerRuntime } from "./tools/video-trimmer";
import { WordCounterRuntime } from "./tools/word-counter";
import { WordFrequencyRuntime } from "./tools/word-frequency";
import { XmlFormatterRuntime } from "./tools/xml-formatter";
import { XmlValidatorRuntime } from "./tools/xml-validator";
import { YamlFormatterRuntime } from "./tools/yaml-formatter";
import { ZipCreatorRuntime } from "./tools/zip-creator";
import type { ReadyToolRuntimeDefinition } from "./types";

export const readyToolRuntimes = [
  AddLineNumbersRuntime,
  AgeCalculatorRuntime,
  ArchiveExtractorRuntime,
  AudioCompressorRuntime,
  AudioConverterRuntime,
  AudioCutterRuntime,
  backgroundRemoverRuntime,
  BarcodeGeneratorRuntime,
  Base64ConverterRuntime,
  BmiCalculatorRuntime,
  CaseConverterRuntime,
  ColorConverterRuntime,
  CronParserRuntime,
  CssGradientGeneratorRuntime,
  CssMinifierRuntime,
  CsvToJsonRuntime,
  CsvViewerRuntime,
  FileHashGeneratorRuntime,
  FileSplitterRuntime,
  FindAndReplaceRuntime,
  GifCompressorRuntime,
  GifMakerRuntime,
  HtmlEntityEncoderRuntime,
  HtmlFormatterRuntime,
  HtmlMinifierRuntime,
  imageCompressorRuntime,
  imageEnhancerRuntime,
  ImageToGifRuntime,
  JsMinifierRuntime,
  JsonFormatterRuntime,
  JsonValidatorRuntime,
  JwtDecoderRuntime,
  LoremIpsumRuntime,
  MarkdownPreviewRuntime,
  MarkdownTableGeneratorRuntime,
  MarkdownToPdfRuntime,
  MarkdownToWordRuntime,
  MetaTagGeneratorRuntime,
  MetadataViewerRuntime,
  PasswordCheckerRuntime,
  passwordGeneratorRuntime,
  PdfCropRuntime,
  PdfHeaderFooterRuntime,
  PdfPageNumbersRuntime,
  PdfToExcelRuntime,
  PdfToPowerpointRuntime,
  PdfToTextRuntime,
  PercentageCalculatorRuntime,
  qrGeneratorRuntime,
  QrReaderRuntime,
  RandomNameRuntime,
  RandomNumberRuntime,
  RegexTesterRuntime,
  RemoveDuplicateLinesRuntime,
  RemoveEmptyLinesRuntime,
  ReverseTextRuntime,
  SlugGeneratorRuntime,
  SortLinesRuntime,
  SqlFormatterRuntime,
  TemperatureConverterRuntime,
  TextCleanerRuntime,
  TextCompareRuntime,
  TextToPdfRuntime,
  TextToSpeechRuntime,
  TextToWordRuntime,
  TimestampConverterRuntime,
  translatorRuntime,
  UnitConverterRuntime,
  UrlEncoderRuntime,
  UuidGeneratorRuntime,
  VideoCompressorRuntime,
  VideoConverterRuntime,
  VideoToGifRuntime,
  VideoTrimmerRuntime,
  WordCounterRuntime,
  WordFrequencyRuntime,
  XmlFormatterRuntime,
  XmlValidatorRuntime,
  YamlFormatterRuntime,
  ZipCreatorRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);
