import { expect, test } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MEGA_TOOLS } from "../src/data/megaToolsCatalog";
import { validateInput } from "./helpers/mega-tools-input";
import { FIXTURES, type FixtureType } from "./fixtures";

const CATEGORY_TO_FIXTURE: Record<string, FixtureType> = {
  images: "images",
  video: "video",
  audio: "audio",
  pdf: "pdf",
};

const EXPECTED_SIGNATURES: Record<FixtureType, (bytes: Uint8Array) => boolean> = {
  images: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  video: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  audio: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45,
  pdf: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
};

test("mega-tools smoke gate: catalog metadata and fixtures are valid", async () => {
  const startedAt = new Date().toISOString();
  const results: Array<Record<string, unknown>> = [];
  const seenSlugs = new Set<string>();
  let failures = 0;

  try {
    for (const variant of MEGA_TOOLS) {
      const fixtureType = CATEGORY_TO_FIXTURE[variant.category];
      const fixtureRelative = fixtureType ? FIXTURES[fixtureType] : undefined;
      const fixtureAbsolute = fixtureRelative ? path.resolve(process.cwd(), fixtureRelative) : "";

      try {
        if (!variant.slug || !variant.name || !variant.category || !variant.handler || !variant.preset) {
          throw new Error("Invalid variant metadata");
        }
        if (seenSlugs.has(variant.slug)) {
          throw new Error(`Duplicate variant slug: ${variant.slug}`);
        }
        seenSlugs.add(variant.slug);

        if (!fixtureType || !fixtureRelative) {
          throw new Error(`No fixture mapping for category: ${String(variant.category)}`);
        }

        const bytes = new Uint8Array(await fs.readFile(fixtureAbsolute));
        if (bytes.length < 12 || !EXPECTED_SIGNATURES[fixtureType](bytes)) {
          throw new Error(`Invalid ${fixtureType} fixture signature: ${fixtureRelative}`);
        }

        validateInput({
          label: variant.name,
          name: variant.name,
          type: variant.category,
          category: variant.category,
          source: variant.category === "video" ? `/fixtures/${path.basename(fixtureRelative)}` : `/fixtures/${path.basename(fixtureRelative)}`,
        });

        results.push({
          slug: variant.slug,
          category: variant.category,
          fixture: fixtureRelative,
          status: "passed",
        });
      } catch (error) {
        failures += 1;
        results.push({
          slug: variant.slug,
          category: variant.category,
          fixture: fixtureRelative ?? null,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    await fs.mkdir(path.resolve(process.cwd(), "test-results"), { recursive: true });
    await fs.writeFile(
      path.resolve(process.cwd(), "test-results/mega-tools-report.json"),
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          totalVariants: MEGA_TOOLS.length,
          passed: results.filter((r) => r.status === "passed").length,
          failed: failures,
          fixtures: FIXTURES,
          results,
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  expect(failures, "Mega-tool smoke failures").toBe(0);
  expect(seenSlugs.size).toBe(MEGA_TOOLS.length);
});
