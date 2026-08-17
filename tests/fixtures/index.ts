export const FIXTURES = {
  images: "/fixtures/image.png",
  video: "/fixtures/video.webm",
  audio: "/fixtures/audio.wav",
  pdf: "/fixtures/sample.pdf",
} as const;

export type FixtureType = keyof typeof FIXTURES;

export function getFixture(type: FixtureType): string {
  return FIXTURES[type];
}

export function isTrustedFixtureSource(source: string): boolean {
  return source.startsWith("blob:") || source.startsWith("/fixtures/") || source.startsWith("/tests/fixtures/");
}
