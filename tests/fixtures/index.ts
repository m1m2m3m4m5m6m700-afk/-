export const FIXTURES = {
  images: "tests/fixtures/image.png",
  video: "tests/fixtures/video.webm",
  audio: "tests/fixtures/audio.wav",
  pdf: "tests/fixtures/sample.pdf",
} as const;

export type FixtureType = keyof typeof FIXTURES;

export function getFixture(type: FixtureType): string {
  return FIXTURES[type];
}

export function getFixtureUrl(type: FixtureType): string {
  return `/${FIXTURES[type]}`;
}

export function isTrustedFixtureSource(source: string): boolean {
  return source.startsWith("blob:") || source.startsWith("/fixtures/") || source.startsWith("/tests/fixtures/");
}
