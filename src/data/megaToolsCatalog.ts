import source from "./megaToolsCatalog.json";

export const PRESETS = source.presets as ReadonlyArray<readonly [string, string]>;

export const MEGA_TOOL_CATEGORIES = Object.freeze({
  images: "Images",
  video: "Video",
  audio: "MP3 & Audio",
  pdf: "PDF",
} as const);

export type MegaToolCategory = keyof typeof MEGA_TOOL_CATEGORIES;
export type MegaToolPreset = (typeof PRESETS)[number][0];
export type MegaToolHandler = string;

export interface MegaTool {
  readonly slug: string;
  readonly name: string;
  readonly category: MegaToolCategory;
  readonly description: string;
  readonly handler: MegaToolHandler;
  readonly preset: MegaToolPreset;
}

const categories = source.categories as Record<MegaToolCategory, ReadonlyArray<readonly [string, string, string]>>;

export const MEGA_TOOLS: readonly MegaTool[] = Object.freeze(
  (Object.entries(categories) as Array<[MegaToolCategory, ReadonlyArray<readonly [string, string, string]>]>).flatMap(
    ([category, definitions]) =>
      definitions.flatMap(([handler, name, description]) =>
        PRESETS.map(([preset, presetName]) => ({
          slug: `mega-${category}-${handler}-${preset}`,
          name: `${name} · ${presetName}`,
          category,
          description: `${description} Preset: ${presetName}.`,
          handler,
          preset,
        })),
      ),
  ),
);

export const MEGA_TOOL_COUNT = MEGA_TOOLS.length;
