const lines = (input: string) => input.split(/\r?\n/);
const nums = (input: string) => input.split(/[,\s]+/).filter(Boolean).map(Number);
const json = (input: string) => JSON.stringify(JSON.parse(input), null, 2);
const jsonCompact = (input: string) => JSON.stringify(JSON.parse(input));
const jsonFlatten = (input: string) => {
  const value = JSON.parse(input) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const walk = (node: unknown, prefix = "") => {
    if (node && typeof node === "object" && !Array.isArray(node)) {
      for (const [key, child] of Object.entries(node)) walk(child, prefix ? `${prefix}.${key}` : key);
    } else out[prefix] = node;
  };
  walk(value);
  return JSON.stringify(out, null, 2);
};
const jsonArrayLength = (input: string) => String((JSON.parse(input) as unknown[]).length);
const countVowels = (input: string) => String((input.match(/[aeiou]/gi) ?? []).length);
const countConsonants = (input: string) => String((input.match(/[bcdfghjklmnpqrstvwxyz]/gi) ?? []).length);
const duplicateChars = (input: string) => [...new Set(Array.from(input))].join("");
const initials = (input: string) => input.trim().split(/\s+/u).filter(Boolean).map((w) => w[0]).join("").toUpperCase();
const acronym = (input: string) => initials(input);
const firstChars = (input: string) => input.trim().split(/\s+/u).filter(Boolean).map((w) => w[0]).join("");
const lastChars = (input: string) => input.trim().split(/\s+/u).filter(Boolean).map((w) => w.at(-1)).join("");
const removeLineNumbers = (input: string) => lines(input).map((line) => line.replace(/^\s*\d+[.)]\s*/, "")).join("\n");
const collapseLines = (input: string) => lines(input).map((line) => line.trim()).filter(Boolean).join(" ");
const indentLines = (input: string) => lines(input).map((line) => `  ${line}`).join("\n");
const removeIndent = (input: string) => lines(input).map((line) => line.replace(/^\s{2}/, "")).join("\n");
const truncateWords = (input: string) => { const [n, ...rest] = input.split("|"); const count = Math.max(0, Math.min(1000, Number(n))); const text = rest.join("|"); return text.split(/\s+/u).slice(0, count).join(" "); };
const takeChars = (input: string) => { const [n, ...rest] = input.split("|"); const count = Math.max(0, Math.min(10000, Number(n))); return Array.from(rest.join("|")).slice(0, count).join(""); };
const dropChars = (input: string) => { const [n, ...rest] = input.split("|"); const count = Math.max(0, Math.min(10000, Number(n))); return Array.from(rest.join("|")).slice(count).join(""); };
const repeatLines = (input: string) => lines(input).flatMap((line) => [line, line]).join("\n");
const reverseLines = (input: string) => lines(input).reverse().join("\n");
const joinLinesComma = (input: string) => lines(input).filter(Boolean).join(", ");
const joinLinesSpace = (input: string) => lines(input).filter(Boolean).join(" ");
const splitWordsLines = (input: string) => input.trim().split(/\s+/u).filter(Boolean).join("\n");
const countParagraphs = (input: string) => String(input.split(/\n\s*\n/u).filter((p) => p.trim()).length);
const countUppercase = (input: string) => String((input.match(/[A-Z]/g) ?? []).length);
const countLowercase = (input: string) => String((input.match(/[a-z]/g) ?? []).length);
const countPunctuation = (input: string) => String((input.match(/[\p{P}]/gu) ?? []).length);
const countSymbols = (input: string) => String((input.match(/[\p{S}]/gu) ?? []).length);
const countEmoji = (input: string) => String((input.match(/[\p{Extended_Pictographic}]/gu) ?? []).length);
const normalizeNewlines = (input: string) => input.replace(/\r\n?/g, "\n");
const windowsNewlines = (input: string) => input.replace(/\r?\n/g, "\r\n");
const removeTrailingWhitespace = (input: string) => lines(input).map((line) => line.replace(/\s+$/u, "")).join("\n");
const removeLeadingWhitespace = (input: string) => lines(input).map((line) => line.replace(/^\s+/u, "")).join("\n");
const centerLines = (input: string) => { const width = Math.max(...lines(input).map((l) => l.length)); return lines(input).map((l) => `${" ".repeat(Math.floor((width - l.length) / 2))}${l}`).join("\n"); };
const padLinesLeft = (input: string) => { const [widthRaw, ...rest] = input.split("|"); const width = Math.max(1, Math.min(200, Number(widthRaw))); return lines(rest.join("|")).map((l) => l.padStart(Math.floor(width))).join("\n"); };
const trimBlankEdges = (input: string) => input.replace(/^(\s*\n)+|((\n\s*)+)$/g, "");
const wordLengthHistogram = (input: string) => { const c = new Map<number, number>(); for (const w of input.trim().split(/\s+/u).filter(Boolean)) c.set(w.length, (c.get(w.length) ?? 0) + 1); return [...c.entries()].sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}: ${v}`).join("\n"); };
const median = (input: string) => { const a = nums(input).sort((x,y)=>x-y); if (!a.length) return "0"; const m = Math.floor(a.length/2); return String(a.length%2 ? a[m] : (a[m-1]+a[m])/2); };
const range = (input: string) => { const a = nums(input); return a.length ? String(Math.max(...a)-Math.min(...a)) : "0"; };
const mode = (input: string) => { const c=new Map<number,number>(); for(const n of nums(input)) c.set(n,(c.get(n)??0)+1); if(!c.size) return "0"; return String([...c.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0][0]); };
const product = (input: string) => String(nums(input).reduce((a,b)=>a*b,1));
const geometricMean = (input: string) => { const a=nums(input); return a.length ? String(a.reduce((p,v)=>p*v,1) ** (1/a.length)) : "0"; };
const weightedAverage = (input: string) => { const pairs=input.split(",").map(p=>p.trim().split(/[:|]/).map(Number)); const sw=pairs.reduce((s,[v,w])=>s+v*w,0); const w=pairs.reduce((s,[,x])=>s+x,0); return String(w ? sw/w : 0); };
const degreesToRadians = (input: string) => String(Number(input) * Math.PI / 180);
const radiansToDegrees = (input: string) => String(Number(input) * 180 / Math.PI);
const binaryToDecimal = (input: string) => String(parseInt(input.trim(), 2));
const decimalToBinary = (input: string) => Math.floor(Number(input)).toString(2);
const octalToDecimal = (input: string) => String(parseInt(input.trim(), 8));
const decimalToOctal = (input: string) => Math.floor(Number(input)).toString(8);
const hexToDecimal = (input: string) => String(parseInt(input.trim().replace(/^0x/i,""), 16));
const decimalToHex = (input: string) => Math.floor(Number(input)).toString(16).toUpperCase();
const bitsToBytes = (input: string) => String(Number(input)/8);
const bytesToBits = (input: string) => String(Number(input)*8);
const centimetersToInches = (input: string) => String(Number(input)/2.54);
const inchesToCentimeters = (input: string) => String(Number(input)*2.54);
const metersToYards = (input: string) => String(Number(input)*1.0936132983);
const yardsToMeters = (input: string) => String(Number(input)/1.0936132983);
const gramsToOunces = (input: string) => String(Number(input)*0.03527396195);
const ouncesToGrams = (input: string) => String(Number(input)/0.03527396195);
const millilitersToLiters = (input: string) => String(Number(input)/1000);
const litersToMilliliters = (input: string) => String(Number(input)*1000);
const daysToHours = (input: string) => String(Number(input)*24);
const hoursToMinutes = (input: string) => String(Number(input)*60);
const minutesToSeconds = (input: string) => String(Number(input)*60);
const secondsToMinutes = (input: string) => String(Number(input)/60);
const queryEncode = (input: string) => encodeURIComponent(input).replace(/%20/g,"+");
const htmlStripComments = (input: string) => input.replace(/<!--[\s\S]*?-->/g, "");
const cssMinifyBasic = (input: string) => input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g," ").replace(/\s*([:;,{}])\s*/g,"$1").trim();
const jsTrimSemicolons = (input: string) => input.replace(/;+\s*$/gm,"");
const escapeJavaScriptString = (input: string) => JSON.stringify(input);
const unescapeJavaScriptString = (input: string) => { try { return String(JSON.parse(input)); } catch { return input; } };
const escapeCsvField = (input: string) => `"${input.replace(/"/g,'""')}"`;
const urlHost = (input: string) => { try { return new URL(input).hostname; } catch { return ""; } };
const urlPath = (input: string) => { try { return new URL(input).pathname; } catch { return ""; } };
const urlOrigin = (input: string) => { try { return new URL(input).origin; } catch { return ""; } };
const ipv4ToNumber = (input: string) => input.split('.').map(Number).reduce((n,o)=>n*256+o,0).toString();
const numberToIpv4 = (input: string) => { let n=BigInt(Math.max(0,Math.min(4294967295,Math.floor(Number(input))))); const a=[]; for(let i=0;i<4;i++){a.unshift(Number(n%256n));n/=256n;} return a.join('.'); };
const jsonBool = (input: string) => String(Boolean(JSON.parse(input)));
const jsonNullish = (input: string) => String(JSON.parse(input) == null);
const jsonArrayUnique = (input: string) => JSON.stringify([...new Set(JSON.parse(input) as unknown[])]);
const jsonValueCount = (input: string) => String(Object.values(JSON.parse(input) as Record<string, unknown>).length);
const jsonHasKey = (input: string) => { const [key, ...rest] = input.split('|'); try { return String(Object.prototype.hasOwnProperty.call(JSON.parse(rest.join('|')), key)); } catch { return "false"; } };
const xmlEscape = (input: string) => input.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");

export const extendedDesktopTools = [
  ["Vowel Counter Extended","utilities","Count Latin vowels.",countVowels,"Flixo","2"],
  ["Consonant Counter","utilities","Count Latin consonants.",countConsonants,"Flixo","3"],
  ["Duplicate Character Remover","utilities","Keep first occurrence of each character.",duplicateChars,"banana","ban"],
  ["Initials Generator","utilities","Generate initials from words.",initials,"Flixo Tools","FT"],
  ["Acronym Generator","utilities","Generate an uppercase acronym.",acronym,"free tools","FT"],
  ["First Character Of Words","utilities","Get first character of each word.",firstChars,"a bb ccc","abc"],
  ["Last Character Of Words","utilities","Get last character of each word.",lastChars,"a bb ccc","abcc"],
  ["Remove Line Numbers","utilities","Remove common line-number prefixes.",removeLineNumbers,"1. a\n2. b","a\nb"],
  ["Collapse Lines","utilities","Join non-empty lines with spaces.",collapseLines,"a\n b","a b"],
  ["Indent Lines","utilities","Indent every line by two spaces.",indentLines,"a\nb","  a\n  b"],
  ["Remove Two-Space Indent","utilities","Remove two-space line indentation.",removeIndent,"  a\n  b","a\nb"],
  ["Take First Words","utilities","Keep the first N words using count|text.",truncateWords,"2|one two three","one two"],
  ["Take First Characters","utilities","Keep the first N characters using count|text.",takeChars,"3|Flixo","Fli"],
  ["Drop First Characters","utilities","Remove the first N characters using count|text.",dropChars,"3|Flixo","xo"],
  ["Duplicate Each Line","utilities","Duplicate every input line.",repeatLines,"a\nb","a\na\nb\nb"],
  ["Reverse Lines","utilities","Reverse line order.",reverseLines,"a\nb","b\na"],
  ["Join Lines With Commas","utilities","Join lines with commas.",joinLinesComma,"a\nb","a, b"],
  ["Join Lines With Spaces","utilities","Join lines with spaces.",joinLinesSpace,"a\nb","a b"],
  ["Words To Lines","utilities","Place every word on its own line.",splitWordsLines,"a b c","a\nb\nc"],
  ["Paragraph Counter Extended","utilities","Count non-empty paragraphs.",countParagraphs,"a\n\nb","2"],
  ["Uppercase Character Counter","utilities","Count uppercase Latin characters.",countUppercase,"AbC","2"],
  ["Lowercase Character Counter","utilities","Count lowercase Latin characters.",countLowercase,"AbC","1"],
  ["Punctuation Counter","utilities","Count Unicode punctuation characters.",countPunctuation,"Hi!","1"],
  ["Symbol Counter","utilities","Count Unicode symbols.",countSymbols,"$","1"],
  ["Emoji Counter","utilities","Count emoji code points.",countEmoji,"😀!","1"],
  ["Normalize Newlines","utilities","Normalize newlines to LF.",normalizeNewlines,"a\r\nb","a\nb"],
  ["Windows Newlines","utilities","Convert newlines to CRLF.",windowsNewlines,"a\nb","a\r\nb"],
  ["Remove Trailing Whitespace","utilities","Trim end-of-line whitespace.",removeTrailingWhitespace,"a  \nb ","a\nb"],
  ["Remove Leading Whitespace","utilities","Trim start-of-line whitespace.",removeLeadingWhitespace,"  a\t b","a b"],
  ["Center Lines","utilities","Center lines relative to the longest line.",centerLines,"abc\na","abc\n a"],
  ["Pad Lines Left","utilities","Pad lines on the left using width|text.",padLinesLeft,"4|ab","  ab"],
  ["Trim Blank Edges","utilities","Remove blank lines around text.",trimBlankEdges,"\n\na\n\n","a"],
  ["Word Length Histogram","utilities","Count words by length.",wordLengthHistogram,"a bb bb","1: 1\n2: 2"],
  ["Median Calculator","calculators","Calculate the median.",median,"1 2 3","2"],
  ["Range Calculator","calculators","Calculate max minus min.",range,"1 5 3","4"],
  ["Mode Calculator","calculators","Calculate the most frequent number.",mode,"1 2 2 3","2"],
  ["Product Calculator","calculators","Multiply numbers.",product,"2 3 4","24"],
  ["Geometric Mean Calculator","calculators","Calculate geometric mean.",geometricMean,"1 4","2"],
  ["Weighted Average Calculator","calculators","Calculate value:weight pairs separated by commas.",weightedAverage,"10:1,20:3","17.5"],
  ["Degrees To Radians","converters","Convert degrees to radians.",degreesToRadians,"180","3.141592653589793"],
  ["Radians To Degrees","converters","Convert radians to degrees.",radiansToDegrees,"3.141592653589793","180"],
  ["Binary To Decimal","converters","Convert binary to decimal.",binaryToDecimal,"1010","10"],
  ["Decimal To Binary","converters","Convert decimal to binary.",decimalToBinary,"10","1010"],
  ["Octal To Decimal","converters","Convert octal to decimal.",octalToDecimal,"12","10"],
  ["Decimal To Octal","converters","Convert decimal to octal.",decimalToOctal,"10","12"],
  ["Hex To Decimal","converters","Convert hexadecimal to decimal.",hexToDecimal,"ff","255"],
  ["Decimal To Hex","converters","Convert decimal to uppercase hexadecimal.",decimalToHex,"255","FF"],
  ["Bits To Bytes","converters","Convert bits to bytes.",bitsToBytes,"16","2"],
  ["Bytes To Bits","converters","Convert bytes to bits.",bytesToBits,"2","16"],
  ["Centimeters To Inches","converters","Convert centimeters to inches.",centimetersToInches,"2.54","1"],
  ["Inches To Centimeters","converters","Convert inches to centimeters.",inchesToCentimeters,"1","2.54"],
  ["Meters To Yards","converters","Convert meters to yards.",metersToYards,"1","1.0936132983"],
  ["Yards To Meters","converters","Convert yards to meters.",yardsToMeters,"1","0.9144000000000001"],
  ["Grams To Ounces","converters","Convert grams to ounces.",gramsToOunces,"1","0.03527396195"],
  ["Ounces To Grams","converters","Convert ounces to grams.",ouncesToGrams,"1","28.349523125"],
  ["Milliliters To Liters","converters","Convert milliliters to liters.",millilitersToLiters,"1000","1"],
  ["Liters To Milliliters","converters","Convert liters to milliliters.",litersToMilliliters,"1","1000"],
  ["Days To Hours","converters","Convert days to hours.",daysToHours,"2","48"],
  ["Hours To Minutes","converters","Convert hours to minutes.",hoursToMinutes,"2","120"],
  ["Minutes To Seconds","converters","Convert minutes to seconds.",minutesToSeconds,"2","120"],
  ["Seconds To Minutes","converters","Convert seconds to minutes.",secondsToMinutes,"120","2"],
  ["Query String Encoder","converters","Encode text for a query string.",queryEncode,"hello world","hello+world"],
  ["HTML Comment Remover","developer","Remove HTML comments.",htmlStripComments,"<p>x</p><!-- y -->","<p>x</p>"],
  ["CSS Minifier Basic","developer","Minify simple CSS without external services.",cssMinifyBasic,"a { color: red; }","a{color:red}"],
  ["JavaScript Semicolon Trimmer","developer","Remove trailing semicolons from lines.",jsTrimSemicolons,"const a=1;\n","const a=1\n"],
  ["JavaScript String Escaper","developer","Encode text as a JavaScript string literal.",escapeJavaScriptString,"Flixo","\"Flixo\""],
  ["JavaScript String Unescaper","developer","Decode a JavaScript/JSON string literal.",unescapeJavaScriptString,"\"Flixo\"","Flixo"],
  ["CSV Field Escaper","converters","Escape one CSV field.",escapeCsvField,"a,b","\"a,b\""],
  ["URL Host Extractor","utilities","Extract hostname from a URL.",urlHost,"https://flixo.tools/a","flixo.tools"],
  ["URL Path Extractor","utilities","Extract path from a URL.",urlPath,"https://flixo.tools/a","/a"],
  ["URL Origin Extractor","utilities","Extract origin from a URL.",urlOrigin,"https://flixo.tools/a","https://flixo.tools"],
  ["IPv4 To Number","developer","Convert an IPv4 address to a 32-bit number.",ipv4ToNumber,"127.0.0.1","2130706433"],
  ["Number To IPv4","developer","Convert a 32-bit number to IPv4.",numberToIpv4,"2130706433","127.0.0.1"],
  ["JSON Boolean Value","developer","Convert JSON value to boolean.",jsonBool,"1","true"],
  ["JSON Null Detector","developer","Check whether a JSON value is nullish.",jsonNullish,"null","true"],
  ["JSON Unique Array","developer","Remove duplicate JSON array values.",jsonArrayUnique,"[1,1,2]","[1,2]"],
  ["JSON Value Counter","developer","Count top-level JSON object values.",jsonValueCount,"{\"a\":1,\"b\":2}","2"],
  ["JSON Key Detector","developer","Check whether a JSON object contains a key using key|json.",jsonHasKey,"a|{\"a\":1}","true"],
  ["XML Entity Encoder","developer","Encode XML entities.",xmlEscape,"<tag>","&lt;tag&gt;"],
] as const;

export const extendedDesktopToolSpecs = extendedDesktopTools.map(([name, categoryId, description, run, sampleInput, expectedSampleOutput]) => {
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
