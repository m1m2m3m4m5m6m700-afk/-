export type DesktopToolCategory = "utilities" | "converters" | "developer" | "calculators";

export type DesktopToolSpec = {
  id: string;
  name: string;
  slug: string;
  categoryId: DesktopToolCategory;
  description: string;
  tags: string[];
  run: (input: string) => string;
  sampleInput: string;
  expectedSampleOutput?: string;
};

const json = (input: string) => JSON.stringify(JSON.parse(input), null, 2);
const compactJson = (input: string) => JSON.stringify(JSON.parse(input));
const lines = (input: string) => input.split(/\r?\n/);
const normalizeWhitespace = (input: string) => input.replace(/\s+/g, " ").trim();
const sentenceCase = (input: string) => input.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => `${p}${c.toUpperCase()}`);
const titleCase = (input: string) => input.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const upper = (input: string) => input.toUpperCase();
const lower = (input: string) => input.toLowerCase();
const reverse = (input: string) => Array.from(input).reverse().join("");
const removeEmpty = (input: string) => lines(input).filter((line) => line.trim()).join("\n");
const uniqueLines = (input: string) => [...new Set(lines(input))].join("\n");
const sortLines = (input: string) => lines(input).sort((a, b) => a.localeCompare(b)).join("\n");
const sortLinesDesc = (input: string) => lines(input).sort((a, b) => b.localeCompare(a)).join("\n");
const trimLines = (input: string) => lines(input).map((line) => line.trim()).join("\n");
const addLineNumbers = (input: string) => lines(input).map((line, i) => `${i + 1}. ${line}`).join("\n");
const wordCount = (input: string) => String(input.trim() ? input.trim().split(/\s+/u).length : 0);
const charCount = (input: string) => String(Array.from(input).length);
const sentenceCount = (input: string) => String((input.match(/[.!?]+(?=\s|$)/g) ?? []).length);
const lineCount = (input: string) => String(lines(input).length);
const slugify = (input: string) => normalizeWhitespace(input).toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gu, "-").replace(/^-+|-+$/g, "");
const kebab = (input: string) => normalizeWhitespace(input).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
const snake = (input: string) => kebab(input).replace(/-/g, "_");
const camel = (input: string) => { const parts = kebab(input).split("-").filter(Boolean); return parts.length ? parts[0] + parts.slice(1).map((part) => part[0].toUpperCase() + part.slice(1)).join("") : ""; };
const pascal = (input: string) => camel(input).replace(/^./, (c) => c.toUpperCase());
const toBase64 = (input: string) => { const bytes = new TextEncoder().encode(input); let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); };
const fromBase64 = (input: string) => { const binary = atob(input); return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))); };
const urlEncode = (input: string) => encodeURIComponent(input);
const urlDecode = (input: string) => decodeURIComponent(input);
const htmlEncode = (input: string) => input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
const htmlDecode = (input: string) => input.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '\"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const csvToJson = (input: string) => { const [header, ...rows] = lines(input).filter(Boolean).map((line) => line.split(",")); if (!header) return "[]"; return JSON.stringify(rows.map((row) => Object.fromEntries(header.map((key, i) => [key.trim(), (row[i] ?? "").trim()]))), null, 2); };
const jsonToCsv = (input: string) => { const value = JSON.parse(input) as Record<string, unknown>[]; if (!Array.isArray(value) || value.length === 0) return ""; const headers = [...new Set(value.flatMap((row) => Object.keys(row)))]; const quote = (item: unknown) => `\"${String(item ?? "").replace(/\"/g, '\"\"')}\"`; return [headers.map(quote).join(","), ...value.map((row) => headers.map((key) => quote(row[key])).join(","))].join("\n"); };
const parseNumbers = (input: string) => input.split(/[,\s]+/).filter(Boolean).map(Number);
const sum = (input: string) => String(parseNumbers(input).reduce((a, b) => a + b, 0));
const average = (input: string) => { const values = parseNumbers(input); return values.length ? String(values.reduce((a, b) => a + b, 0) / values.length) : "0"; };
const min = (input: string) => String(Math.min(...parseNumbers(input)));
const max = (input: string) => String(Math.max(...parseNumbers(input)));
const uniqueWords = (input: string) => [...new Set(input.toLowerCase().split(/\s+/u).filter(Boolean))].sort().join("\n");
const wordFrequency = (input: string) => { const counts = new Map<string, number>(); for (const word of input.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) counts.set(word, (counts.get(word) ?? 0) + 1); return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([word, count]) => `${word}: ${count}`).join("\n"); };
const jsonKeys = (input: string) => Object.keys(JSON.parse(input)).join("\n");
const jsonValues = (input: string) => Object.values(JSON.parse(input)).map(String).join("\n");
const jsonType = (input: string) => Array.isArray(JSON.parse(input)) ? "array" : typeof JSON.parse(input);
const regexEscape = (input: string) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mdToText = (input: string) => input.replace(/[`*_>#~]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
const stripHtml = (input: string) => input.replace(/<[^>]*>/g, "");
const extractEmails = (input: string) => [...new Set(input.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [])].join("\n");
const extractUrls = (input: string) => [...new Set(input.match(/https?:\/\/[^\s]+/gi) ?? [])].join("\n");
const extractNumbers = (input: string) => (input.match(/-?\d+(?:\.\d+)?/g) ?? []).join("\n");
const replaceTabs = (input: string) => input.replace(/\t/g, "  ");
const removePunctuation = (input: string) => input.replace(/[\p{P}\p{S}]/gu, "");
const lettersOnly = (input: string) => input.replace(/[^\p{L}\s]/gu, "");
const numbersOnly = (input: string) => input.replace(/[^\d.\-+\s]/g, "");
const firstLine = (input: string) => lines(input)[0] ?? "";
const lastLine = (input: string) => lines(input).at(-1) ?? "";
const longestLine = (input: string) => lines(input).reduce((a, b) => (b.length > a.length ? b : a), "");
const shortestLine = (input: string) => lines(input).reduce((a, b) => (!a || b.length < a.length ? b : a), "");
const wrap80 = (input: string) => input.match(/.{1,80}(?:\s|$)/g)?.map((x) => x.trim()).join("\n") ?? input;
const dedupeWords = (input: string) => [...new Set(input.split(/\s+/u).filter(Boolean))].join(" ");
const alternateCase = (input: string) => Array.from(input).map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase()).join("");
const rot13 = (input: string) => input.replace(/[a-zA-Z]/g, (c) => String.fromCharCode(c <= "Z" ? (c.charCodeAt(0) - 65 + 13) % 26 + 65 : (c.charCodeAt(0) - 97 + 13) % 26 + 97));
const binary = (input: string) => Array.from(new TextEncoder().encode(input)).map((b) => b.toString(2).padStart(8, "0")).join(" ");
const fromBinary = (input: string) => new TextDecoder().decode(Uint8Array.from(input.trim().split(/\s+/).map((b) => parseInt(b, 2))));
const hex = (input: string) => Array.from(new TextEncoder().encode(input)).map((b) => b.toString(16).padStart(2, "0")).join(" ");
const fromHex = (input: string) => new TextDecoder().decode(Uint8Array.from(input.replace(/\s+/g, "").match(/.{1,2}/g) ?? [], (pair) => parseInt(pair, 16)));
const unicodeCodePoints = (input: string) => Array.from(input).map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`).join("\n");
const countBytes = (input: string) => String(new TextEncoder().encode(input).length);
const lineLengths = (input: string) => lines(input).map((line, i) => `${i + 1}: ${line.length}`).join("\n");
const jsonPathTop = (input: string) => Object.keys(JSON.parse(input)).map((key) => `$.${key}`).join("\n");
const yamlToJsonBasic = (input: string) => JSON.stringify(Object.fromEntries(lines(input).filter((l) => l.includes(":")).map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })), null, 2);
const htmlPretty = (input: string) => input.replace(/></g, ">\n<").split("\n").map((line) => line.trim()).join("\n");
const sqlUpper = (input: string) => input.replace(/\b(select|from|where|and|or|insert|into|values|update|set|delete|join|left|right|inner|outer|group|by|order|limit|as|on)\b/gi, (m) => m.toUpperCase());
const jsonSortKeys = (input: string) => { const value = JSON.parse(input) as Record<string, unknown>; return JSON.stringify(Object.fromEntries(Object.keys(value).sort().map((k) => [k, value[k]])), null, 2); };
const quoteEachLine = (input: string) => lines(input).map((line) => `\"${line.replace(/\"/g, '\"\"')}\"`).join("\n");

const specs: Omit<DesktopToolSpec, "id" | "slug">[] = [
  ["Remove Spaces", "utilities", "Remove extra spaces.", removeEmpty, "a  b", "a  b"],
  ["Normalize Whitespace", "utilities", "Normalize whitespace.", normalizeWhitespace, "  a   b  ", "a b"],
  ["Uppercase Text", "utilities", "Convert text to uppercase.", upper, "Flixo", "FLIXO"],
  ["Lowercase Text", "utilities", "Convert text to lowercase.", lower, "FLIXO", "flixo"],
  ["Title Case", "utilities", "Convert text to title case.", titleCase, "hello world", "Hello World"],
  ["Sentence Case", "utilities", "Convert text to sentence case.", sentenceCase, "hello world. test", "Hello world. Test"],
  ["Reverse Text", "utilities", "Reverse text safely.", reverse, "abc", "cba"],
  ["Remove Empty Lines", "utilities", "Remove empty lines.", removeEmpty, "a\n\n b", "a\n b"],
  ["Unique Lines", "utilities", "Remove duplicate lines.", uniqueLines, "a\na\nb", "a\nb"],
  ["Sort Lines", "utilities", "Sort lines ascending.", sortLines, "b\na", "a\nb"],
  ["Sort Lines Descending", "utilities", "Sort lines descending.", sortLinesDesc, "a\nb", "b\na"],
  ["Trim Lines", "utilities", "Trim each line.", trimLines, " a \n b ", "a\nb"],
  ["Add Line Numbers", "utilities", "Number each line.", addLineNumbers, "a\nb", "1. a\n2. b"],
  ["Word Counter", "utilities", "Count words.", wordCount, "a b c", "3"],
  ["Character Counter", "utilities", "Count characters.", charCount, "abc", "3"],
  ["Sentence Counter", "utilities", "Count sentences.", sentenceCount, "a. b!", "2"],
  ["Line Counter", "utilities", "Count lines.", lineCount, "a\nb", "2"],
  ["Slug Generator", "utilities", "Generate URL slugs.", slugify, "Hello World!", "hello-world"],
  ["Kebab Case Converter", "utilities", "Convert to kebab-case.", kebab, "HelloWorld", "hello-world"],
  ["Snake Case Converter", "utilities", "Convert to snake_case.", snake, "Hello World", "hello_world"],
  ["Camel Case Converter", "utilities", "Convert to camelCase.", camel, "hello world", "helloWorld"],
  ["Pascal Case Converter", "utilities", "Convert to PascalCase.", pascal, "hello world", "HelloWorld"],
  ["Base64 Encoder", "converters", "Encode text as Base64.", toBase64, "Flixo", "RmxpeG8="],
  ["Base64 Decoder", "converters", "Decode Base64 text.", fromBase64, "RmxpeG8=", "Flixo"],
  ["URL Encoder", "converters", "Encode URL text.", urlEncode, "hello world", "hello%20world"],
  ["URL Decoder", "converters", "Decode URL text.", urlDecode, "hello%20world", "hello world"],
  ["HTML Encoder", "developer", "Encode HTML entities.", htmlEncode, "<b>", "&lt;b&gt;"],
  ["HTML Decoder", "developer", "Decode HTML entities.", htmlDecode, "&lt;b&gt;", "<b>"],
  ["CSV to JSON", "converters", "Convert basic CSV to JSON.", csvToJson, "name,age\nAli,20", '[\n  {\n    "name": "Ali",\n    "age": "20"\n  }\n]'],
  ["JSON to CSV", "converters", "Convert JSON rows to CSV.", jsonToCsv, '[{"name":"Ali","age":20}]', '"name","age"\n"Ali","20"'],
  ["JSON Formatter", "developer", "Pretty-print JSON.", json, '{"a":1}', '{\n  "a": 1\n}'],
  ["JSON Minifier", "developer", "Minify JSON.", compactJson, '{ "a": 1 }', '{"a":1}'],
  ["JSON Keys", "developer", "List top-level JSON keys.", jsonKeys, '{"a":1,"b":2}', "a\nb"],
  ["JSON Values", "developer", "List top-level JSON values.", jsonValues, '{"a":1,"b":2}', "1\n2"],
  ["JSON Type Detector", "developer", "Detect top-level JSON type.", jsonType, '[1]', "array"],
  ["JSON Sort Keys", "developer", "Sort JSON keys.", jsonSortKeys, '{"b":2,"a":1}', '{\n  "a": 1,\n  "b": 2\n}'],
  ["JSON Path Generator", "developer", "List top-level JSON paths.", jsonPathTop, '{"user":{"id":1}}', "$.user"],
  ["Regex Escape", "developer", "Escape regex characters.", regexEscape, "a+b", "a\\+b"],
  ["Markdown to Text", "developer", "Strip Markdown formatting.", mdToText, "# Hello", " Hello"],
  ["HTML to Text", "developer", "Strip HTML tags.", stripHtml, "<p>Hello</p>", "Hello"],
  ["SQL Keyword Uppercaser", "developer", "Uppercase common SQL keywords.", sqlUpper, "select * from users", "SELECT * FROM users"],
  ["HTML Pretty Printer", "developer", "Format HTML tags line by line.", htmlPretty, "<div><p>x</p></div>", "<div>\n<p>x</p>\n</div>"],
  ["YAML Basic to JSON", "developer", "Convert simple key-value YAML to JSON.", yamlToJsonBasic, "name: Flixo", '{\n  "name": "Flixo"\n}'],
  ["Extract Emails", "utilities", "Extract email addresses.", extractEmails, "a@example.com b@example.com", "a@example.com\nb@example.com"],
  ["Extract URLs", "utilities", "Extract HTTP URLs.", extractUrls, "See https://flixo.tools now", "https://flixo.tools"],
  ["Extract Numbers", "utilities", "Extract numeric tokens.", extractNumbers, "x=12 y=-3.5", "12\n-3.5"],
  ["Replace Tabs", "utilities", "Replace tabs with spaces.", replaceTabs, "a\tb", "a  b"],
  ["Remove Punctuation", "utilities", "Remove punctuation and symbols.", removePunctuation, "Hi! @Flixo.", "Hi Flixo"],
  ["Letters Only", "utilities", "Keep letters and spaces only.", lettersOnly, "a1-b", "ab"],
  ["Numbers Only", "utilities", "Keep numeric content.", numbersOnly, "a12-b", "12-"],
  ["First Line", "utilities", "Return first line.", firstLine, "a\nb", "a"],
  ["Last Line", "utilities", "Return last line.", lastLine, "a\nb", "b"],
  ["Longest Line", "utilities", "Find longest line.", longestLine, "a\nhello", "hello"],
  ["Shortest Line", "utilities", "Find shortest line.", shortestLine, "hello\na", "a"],
  ["Wrap Text 80", "utilities", "Wrap long text.", wrap80, "hello world", "hello world"],
  ["Dedupe Words", "utilities", "Remove duplicate words.", dedupeWords, "a a b", "a b"],
  ["Alternating Case", "utilities", "Alternate character case.", alternateCase, "abcd", "AbCd"],
  ["ROT13", "utilities", "Encode/decode ROT13.", rot13, "hello", "uryyb"],
  ["Text to Binary", "converters", "Convert text to binary bytes.", binary, "A", "01000001"],
  ["Binary to Text", "converters", "Convert binary bytes to text.", fromBinary, "01000001", "A"],
  ["Text to Hex", "converters", "Convert text to hexadecimal bytes.", hex, "A", "41"],
  ["Hex to Text", "converters", "Convert hexadecimal bytes to text.", fromHex, "41", "A"],
  ["Unicode Code Points", "developer", "List Unicode code points.", unicodeCodePoints, "A", "U+0041"],
  ["UTF-8 Byte Counter", "utilities", "Count UTF-8 bytes.", countBytes, "é", "2"],
  ["Line Length Analyzer", "utilities", "List line lengths.", lineLengths, "a\nxyz", "1: 1\n2: 3"],
  ["Unique Word List", "utilities", "List unique words.", uniqueWords, "b a a", "a\nb"],
  ["Word Frequency", "utilities", "Count word frequency.", wordFrequency, "a a b", "a: 2\nb: 1"],
  ["Sum Numbers", "calculators", "Sum numbers from text.", sum, "1 2 3", "6"],
  ["Average Numbers", "calculators", "Average numbers from text.", average, "1 2 3", "2"],
  ["Minimum Number", "calculators", "Find minimum number.", min, "3 1 2", "1"],
  ["Maximum Number", "calculators", "Find maximum number.", max, "3 1 2", "3"],
  ["Percentage of Total", "calculators", "Calculate simple percentage.", (input) => { const [a, b] = parseNumbers(input); return String((a / b) * 100); }, "25 100", "25"],
  ["Percentage Increase", "calculators", "Calculate percentage increase.", (input) => { const [a, b] = parseNumbers(input); return String(((b - a) / a) * 100); }, "100 120", "20"],
  ["Percentage Decrease", "calculators", "Calculate percentage decrease.", (input) => { const [a, b] = parseNumbers(input); return String(((a - b) / a) * 100); }, "100 80", "20"],
  ["Ratio Simplifier", "calculators", "Simplify a two-number ratio.", (input) => { const [a, b] = parseNumbers(input); const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : Math.abs(x); const g = gcd(a, b); return `${a / g}:${b / g}`; }, "8 12", "2:3"],
  ["Round Number", "calculators", "Round to nearest integer.", (input) => String(Math.round(Number(input))), "3.6", "4"],
  ["Floor Number", "calculators", "Floor a number.", (input) => String(Math.floor(Number(input))), "3.6", "3"],
  ["Ceil Number", "calculators", "Ceil a number.", (input) => String(Math.ceil(Number(input))), "3.1", "4"],
  ["Absolute Value", "calculators", "Get absolute value.", (input) => String(Math.abs(Number(input))), "-5", "5"],
  ["Square Number", "calculators", "Square a number.", (input) => String(Number(input) ** 2), "5", "25"],
  ["Cube Number", "calculators", "Cube a number.", (input) => String(Number(input) ** 3), "3", "27"],
  ["Square Root", "calculators", "Calculate square root.", (input) => String(Math.sqrt(Number(input))), "9", "3"],
  ["Power Calculator", "calculators", "Raise a number to a power.", (input) => { const [a, b] = parseNumbers(input); return String(a ** b); }, "2 3", "8"],
  ["GCD Calculator", "calculators", "Calculate greatest common divisor.", (input) => { const [a, b] = parseNumbers(input); const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : Math.abs(x); return String(gcd(a, b)); }, "12 8", "4"],
  ["LCM Calculator", "calculators", "Calculate least common multiple.", (input) => { const [a, b] = parseNumbers(input); const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : Math.abs(x); return String(Math.abs(a * b) / gcd(a, b)); }, "4 6", "12"],
  ["Decimal to Percent", "calculators", "Convert decimal to percent.", (input) => String(Number(input) * 100), "0.25", "25"],
  ["Percent to Decimal", "calculators", "Convert percent to decimal.", (input) => String(Number(input) / 100), "25", "0.25"],
  ["Celsius to Fahrenheit", "converters", "Convert Celsius to Fahrenheit.", (input) => String(Number(input) * 9 / 5 + 32), "0", "32"],
  ["Fahrenheit to Celsius", "converters", "Convert Fahrenheit to Celsius.", (input) => String((Number(input) - 32) * 5 / 9), "32", "0"],
  ["Kilometers to Miles", "converters", "Convert kilometers to miles.", (input) => String(Number(input) * 0.621371), "1", "0.621371"],
  ["Miles to Kilometers", "converters", "Convert miles to kilometers.", (input) => String(Number(input) / 0.621371), "0.621371", "1"],
  ["Meters to Feet", "converters", "Convert meters to feet.", (input) => String(Number(input) * 3.28084), "1", "3.28084"],
  ["Feet to Meters", "converters", "Convert feet to meters.", (input) => String(Number(input) / 3.28084), "3.28084", "1"],
  ["Kilograms to Pounds", "converters", "Convert kilograms to pounds.", (input) => String(Number(input) * 2.2046226218), "1", "2.2046226218"],
  ["Pounds to Kilograms", "converters", "Convert pounds to kilograms.", (input) => String(Number(input) / 2.2046226218), "2.2046226218", "1"],
  ["Liters to Gallons", "converters", "Convert liters to US gallons.", (input) => String(Number(input) * 0.2641720524), "1", "0.2641720524"],
  ["Gallons to Liters", "converters", "Convert US gallons to liters.", (input) => String(Number(input) / 0.2641720524), "0.2641720524", "1"],
  ["Bytes to KB", "converters", "Convert bytes to kilobytes.", (input) => String(Number(input) / 1024), "1024", "1"],
  ["KB to Bytes", "converters", "Convert kilobytes to bytes.", (input) => String(Number(input) * 1024), "1", "1024"],
  ["MB to GB", "converters", "Convert megabytes to gigabytes.", (input) => String(Number(input) / 1024), "1024", "1"],
  ["GB to MB", "converters", "Convert gigabytes to megabytes.", (input) => String(Number(input) * 1024), "1", "1024"],
  ["Unix Timestamp to ISO", "converters", "Convert a Unix timestamp to ISO time.", (input) => new Date(Number(input) * 1000).toISOString(), "0", "1970-01-01T00:00:00.000Z"],
  ["ISO to Unix Timestamp", "converters", "Convert ISO time to Unix seconds.", (input) => String(Math.floor(new Date(input).getTime() / 1000)), "1970-01-01T00:00:00.000Z", "0"],
  ["Text to Quoted Lines", "utilities", "Quote each line.", quoteEachLine, "a\nb", '\"a\"\n\"b\"'],
  ["CSV Quote Lines", "converters", "Quote CSV-like lines safely.", quoteEachLine, "a,b\nc,d", '\"a,b\"\n\"c,d\"'],
  ["Text Deduplicator", "utilities", "Remove duplicate words while preserving order.", dedupeWords, "a b a c", "a b c"],
  ["Paragraph Counter", "utilities", "Count paragraphs.", (input) => String(input.split(/\n\s*\n/u).filter((p) => p.trim()).length), "a\n\nb", "2"],
  ["Whitespace Character Counter", "utilities", "Count whitespace characters.", (input) => String((input.match(/\s/gu) ?? []).length), "a b", "1"],
  ["Digit Counter", "utilities", "Count digits.", (input) => String((input.match(/\d/g) ?? []).length), "a12b3", "3"],
  ["Letter Counter", "utilities", "Count letters.", (input) => String((input.match(/\p{L}/gu) ?? []).length), "a1b", "2"],
  ["ASCII Detector", "utilities", "Check whether input is ASCII only.", (input) => String(/^[\x00-\x7F]*$/.test(input)), "abc", "true"],
  ["URL Detector", "utilities", "Check whether input looks like a URL.", (input) => String(/^https?:\/\//i.test(input.trim())), "https://flixo.tools", "true"],
  ["Email Detector", "utilities", "Check whether input looks like an email.", (input) => String(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.trim())), "a@example.com", "true"],
  ["JSON Detector", "developer", "Check whether input is valid JSON.", (input) => { try { JSON.parse(input); return "true"; } catch { return "false"; } }, '{"a":1}', "true"],
  ["JSON Array Length", "developer", "Count JSON array elements.", (input) => String((JSON.parse(input) as unknown[]).length), "[1,2,3]", "3"],
  ["JSON Pretty Sort", "developer", "Pretty-print JSON with sorted top-level keys.", jsonSortKeys, '{"b":2,"a":1}', '{\n  "a": 1,\n  "b": 2\n}'],
];

export const desktopToolCatalog: DesktopToolSpec[] = specs.map(([name, categoryId, description, run, sampleInput, expectedSampleOutput]) => {
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
});

if (desktopToolCatalog.length < 120) {
  throw new Error(`Desktop catalog contains only ${desktopToolCatalog.length} tools; at least 120 are required.`);
}
