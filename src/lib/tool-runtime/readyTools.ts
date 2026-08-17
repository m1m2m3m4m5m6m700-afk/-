import { Base64ConverterRuntime } from "./tools/base64-converter";
import { CaseConverterRuntime } from "./tools/case-converter";
import { JsonFormatterRuntime } from "./tools/json-formatter";
import { TextCompareRuntime } from "./tools/text-compare";
import { TimestampConverterRuntime } from "./tools/timestamp-converter";
import { UrlEncoderRuntime } from "./tools/url-encoder";
import { UuidGeneratorRuntime } from "./tools/uuid-generator";
import { WordCounterRuntime } from "./tools/word-counter";
import type { ReadyToolRuntimeDefinition } from "./types";

/**
 * Public tool registry.
 *
 * A runtime is publishable only after its dedicated browser regression test
 * passes. Legacy runtimes remain in the repository but are intentionally not
 * reachable from the public tool route until they are promoted here.
 */
export const readyToolRuntimes = [
  WordCounterRuntime,
  JsonFormatterRuntime,
  Base64ConverterRuntime,
  UuidGeneratorRuntime,
  UrlEncoderRuntime,
  CaseConverterRuntime,
  TimestampConverterRuntime,
  TextCompareRuntime,
] as const satisfies readonly ReadyToolRuntimeDefinition[];

export const readyToolRuntimeBySlug = new Map<string, ReadyToolRuntimeDefinition>(
  readyToolRuntimes.map((runtime) => [runtime.slug, runtime]),
);

export const getReadyToolRuntime = (slug: string): ReadyToolRuntimeDefinition | undefined =>
  readyToolRuntimeBySlug.get(slug);

export const VERIFIED_TOOL_SLUGS = Object.freeze(
  readyToolRuntimes.map((runtime) => runtime.slug),
);
