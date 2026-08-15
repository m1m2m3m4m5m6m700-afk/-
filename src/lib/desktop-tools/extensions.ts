export const desktopToolExtensions = [
  {
    id: "desktop-vowel-counter",
    name: "Vowel Counter",
    slug: "desktop-vowel-counter",
    categoryId: "utilities",
    description: "Count Latin vowels in text.",
    tags: ["vowel", "count", "text"],
    run: (input: string) => String((input.match(/[aeiou]/gi) ?? []).length),
    sampleInput: "Flixo",
    expectedSampleOutput: "2",
  },
  {
    id: "desktop-repeat-text",
    name: "Repeat Text",
    slug: "desktop-repeat-text",
    categoryId: "utilities",
    description: "Repeat text a fixed number of times using a compact input format: count|text.",
    tags: ["repeat", "text", "utility"],
    run: (input: string) => {
      const separator = input.indexOf("|");
      const count = Math.max(0, Math.min(20, Number(input.slice(0, separator))));
      const text = separator >= 0 ? input.slice(separator + 1) : input;
      if (!Number.isFinite(count) || separator < 0) return text;
      return Array.from({ length: Math.floor(count) }, () => text).join("\n");
    },
    sampleInput: "3|Flixo",
    expectedSampleOutput: "Flixo\nFlixo\nFlixo",
  },
  {
    id: "desktop-strip-non-ascii",
    name: "Strip Non-ASCII",
    slug: "desktop-strip-non-ascii",
    categoryId: "utilities",
    description: "Remove characters outside the ASCII range.",
    tags: ["ascii", "clean", "text"],
    run: (input: string) => Array.from(input).filter((char) => char.codePointAt(0)! <= 0x7f).join(""),
    sampleInput: "Flixo — أدوات",
    expectedSampleOutput: "Flixo ",
  },
  {
    id: "desktop-pad-lines",
    name: "Pad Lines",
    slug: "desktop-pad-lines",
    categoryId: "utilities",
    description: "Pad each line on the right to a fixed width using spaces: width|text.",
    tags: ["pad", "lines", "format"],
    run: (input: string) => {
      const separator = input.indexOf("|");
      const width = separator >= 0 ? Math.max(0, Math.min(200, Number(input.slice(0, separator)))) : 0;
      const text = separator >= 0 ? input.slice(separator + 1) : input;
      if (!Number.isFinite(width) || width <= 0) return text;
      return text.split(/\r?\n/).map((line) => line.padEnd(Math.floor(width), " ")).join("\n");
    },
    sampleInput: "6|ab",
    expectedSampleOutput: "ab    ",
  },
] as const;
