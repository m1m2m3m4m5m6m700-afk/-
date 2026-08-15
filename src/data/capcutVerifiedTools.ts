/**
 * CapCut-style video capabilities that Flixo can expose today because they
 * already run through the real MegaTool engine and are covered by the
 * operational browser test suite. This is a capability mapping, not copied
 * CapCut code or branding.
 */
export const CAPCUT_VERIFIED_VIDEO_HANDLERS = [
  "inspect",
  "poster",
  "frame-25",
  "frame-50",
  "frame-75",
  "resize",
  "rotate",
  "flip",
  "mute",
  "speed",
  "metadata",
  "contact-sheet",
] as const;

export type CapCutVerifiedVideoHandler =
  (typeof CAPCUT_VERIFIED_VIDEO_HANDLERS)[number];

export const CAPCUT_VERIFIED_VIDEO_CAPABILITIES = {
  inspect: "Video metadata",
  poster: "Poster frame",
  "frame-25": "Frame at 25%",
  "frame-50": "Frame at 50%",
  "frame-75": "Frame at 75%",
  resize: "Resize preview",
  rotate: "Rotate preview",
  flip: "Mirror preview",
  mute: "Muted playback",
  speed: "Playback speed preview",
  metadata: "Metadata report",
  "contact-sheet": "Contact sheet",
} as const satisfies Record<CapCutVerifiedVideoHandler, string>;

/**
 * These are deliberately limited to capabilities already present in the
 * tested MegaTool engine. Do not add trim/split/merge/crop/subtitles/background
 * removal here until the actual output is covered by the operational fixture
 * tests as well.
 */
