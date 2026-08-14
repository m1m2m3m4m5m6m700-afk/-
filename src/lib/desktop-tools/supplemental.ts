const averageLineLength = (input: string) => {
  const lengths = input.split(/\r?\n/).map((line) => line.length);
  return lengths.length ? String(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : "0";
};

export const supplementalDesktopToolSpecs = [
  [
    "Average Line Length",
    "utilities",
    "Calculate the average character length of input lines.",
    averageLineLength,
    "a\nxyz",
    "2",
  ],
] as const;

export const supplementalDesktopTools = supplementalDesktopToolSpecs.map(
  ([name, categoryId, description, run, sampleInput, expectedSampleOutput]) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return {
      id: `desktop-${slug}`,
      name,
      slug: `desktop-${slug}`,
      categoryId,
      description,
      tags: name.toLowerCase().split(/\s+/),
      run,
      sampleInput,
      expectedSampleOutput,
    };
  },
);
