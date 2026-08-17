import type { Page } from "@playwright/test";

export type MegaToolVariantLike = {
  label?: unknown;
  name?: unknown;
  slug?: unknown;
  type?: unknown;
  category?: unknown;
  source?: unknown;
  [key: string]: unknown;
};

const TRUSTED_LOCAL_SOURCE = /^(?:blob:|\/?(?:fixtures|tests\/fixtures)\/)/;

/**
 * Validate variant metadata before any browser/tool execution starts.
 * Video inputs are restricted to trusted blob URLs or repository-local fixtures.
 */
export function validateInput(variant: MegaToolVariantLike): asserts variant is MegaToolVariantLike & { label: string } {
  if (!variant || typeof variant !== "object") {
    throw new Error("Invalid variant metadata");
  }

  const label = typeof variant.label === "string" ? variant.label : variant.name;
  if (typeof label !== "string" || !label.trim()) {
    throw new Error("Invalid variant metadata");
  }

  if (variant.type === "video" || variant.category === "video") {
    if (typeof variant.source !== "string" || !TRUSTED_LOCAL_SOURCE.test(variant.source)) {
      throw new Error("Video source must be trusted blob/local fixture");
    }
  }
}

export type MegaToolAdapter = (page: Page, variant: MegaToolVariantLike) => Promise<unknown>;

export function createMegaToolAdapter(runner: MegaToolAdapter): MegaToolAdapter {
  return async (page, variant) => {
    validateInput(variant);
    return runner(page, variant);
  };
}
