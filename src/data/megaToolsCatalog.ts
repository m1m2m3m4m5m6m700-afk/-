import deprecatedTools from "./deprecated-tools.json";

export const PRESETS = [
  ["quick", "Quick"],
  ["small", "Small"],
  ["medium", "Medium"],
  ["large", "Large"],
  ["social", "Social"],
  ["web", "Web"],
  ["mobile", "Mobile"],
  ["print", "Print"],
  ["hd", "HD"],
  ["pro", "Pro"],
  ["max", "Max"],
] as const;

export const MEGA_TOOL_CATEGORIES = {
  images: "Images",
  video: "Video",
  audio: "MP3 & Audio",
  pdf: "PDF",
} as const;

export type MegaToolCategory = keyof typeof MEGA_TOOL_CATEGORIES;
export type MegaToolPreset = (typeof PRESETS)[number][0];

const IMAGE_HANDLERS = [
  ["resize", "Resize", "Resize to a controlled target size."],
  ["compress", "Compress", "Reduce file size with quality controls."],
  ["convert-png", "Convert to PNG", "Convert output to PNG."],
  ["convert-jpg", "Convert to JPG", "Convert output to JPEG."],
  ["convert-webp", "Convert to WebP", "Convert output to WebP."],
  ["rotate", "Rotate", "Rotate the image by 90 degrees."],
  ["flip", "Flip", "Flip the image horizontally."],
  ["grayscale", "Grayscale", "Convert the image to grayscale."],
  ["invert", "Invert", "Invert image colors."],
  ["brightness", "Brightness", "Adjust image brightness."],
  ["contrast", "Contrast", "Adjust image contrast."],
  ["saturation", "Saturation", "Adjust color saturation."],
] as const;

const VIDEO_HANDLERS = [
  ["inspect", "Inspect", "Read duration, dimensions and frame-rate metadata."],
  ["poster", "Poster Frame", "Capture a representative poster frame."],
  ["frame-25", "Frame at 25%", "Capture a frame at 25% of the duration."],
  ["frame-50", "Frame at 50%", "Capture a frame at 50% of the duration."],
  ["frame-75", "Frame at 75%", "Capture a frame at 75% of the duration."],
  ["resize", "Resize Preview", "Render a resized preview frame."],
  ["rotate", "Rotate Preview", "Render a rotated preview frame."],
  ["flip", "Mirror Preview", "Render a mirrored preview frame."],
  ["mute", "Muted Preview", "Preview the video muted."],
  ["speed", "Speed Preview", "Preview the video at a different playback rate."],
  ["metadata", "Metadata Report", "Read the video's core metadata."],
  ["contact-sheet", "Contact Sheet", "Create a contact sheet from representative frames."],
] as const;

const AUDIO_HANDLERS = [
  ["inspect", "Inspect", "Read duration, sample rate and channel metadata."],
  ["waveform", "Waveform", "Generate a waveform preview image."],
  ["peak", "Peak Level", "Measure the peak signal level."],
  ["rms", "RMS Level", "Measure average signal energy."],
  ["normalize", "Normalize", "Normalize audio to a safe target peak."],
  ["trim", "Trim", "Create a trimmed audio variant."],
  ["fade-in", "Fade In", "Apply a fade-in to the audio buffer."],
  ["fade-out", "Fade Out", "Apply a fade-out to the audio buffer."],
  ["mono", "Mono", "Downmix audio to mono."],
  ["reverse", "Reverse", "Reverse the audio buffer."],
  ["speed", "Resample", "Create a speed-adjusted audio variant."],
  ["wav", "Export WAV", "Export decoded audio to WAV."],
] as const;

const PDF_HANDLERS = [
  ["inspect", "Inspect", "Report pages and document metadata."],
  ["extract-text", "Extract Text", "Extract readable text from PDF content streams."],
  ["rotate", "Rotate Pages", "Rotate every page by 90 degrees."],
  ["page-numbers", "Page Numbers", "Add page numbers to the document."],
  ["watermark", "Watermark", "Add a Flixo watermark to pages."],
  ["remove-metadata", "Remove Metadata", "Remove common document metadata."],
  ["duplicate", "Duplicate Pages", "Create a document containing the last page."],
  ["extract-range", "Extract Range", "Extract the first half of the pages."],
  ["split-even", "Split Even", "Extract even-numbered pages into a new PDF."],
  ["blank-cover", "Blank Cover", "Prepend a blank cover page."],
  ["flatten", "Flatten", "Flatten PDF form fields where supported."],
  ["poster", "Page Poster", "Create a rendered poster of the first page."],
] as const;

export const HANDLERS_BY_CATEGORY = {
  images: IMAGE_HANDLERS,
  video: VIDEO_HANDLERS,
  audio: AUDIO_HANDLERS,
  pdf: PDF_HANDLERS,
} as const;

export type MegaToolHandler = (typeof HANDLERS_BY_CATEGORY)[MegaToolCategory][number][0];

export interface MegaTool {
  readonly slug: string;
  readonly name: string;
  readonly category: MegaToolCategory;
  readonly description: string;
  readonly handler: string;
  readonly preset: MegaToolPreset;
}

function buildTools<const T extends MegaToolCategory>(category: T) {
  const definitions = HANDLERS_BY_CATEGORY[category];
  return definitions.flatMap(([handler, name, description]) =>
    PRESETS.map(([preset, presetName]) => ({
      slug: `mega-${category}-${handler}-${preset}`,
      name: `${name} · ${presetName}`,
      category,
      description: `${description} Preset: ${presetName}.`,
      handler,
      preset,
    })),
  );
}

const DEPRECATED_SLUGS = new Set(deprecatedTools.map((entry) => entry.slug));

export const MEGA_TOOLS = Object.freeze([
  ...buildTools("images"),
  ...buildTools("video"),
  ...buildTools("audio"),
  ...buildTools("pdf"),
].filter((tool) => !DEPRECATED_SLUGS.has(tool.slug))) as readonly MegaTool[];

export const MEGA_TOOL_COUNT = MEGA_TOOLS.length;
