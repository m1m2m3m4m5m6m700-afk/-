import { useState } from "react";
import { CheckCircle2, AlertCircle, RotateCcw, FileCheck2 } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

interface ValidationResult {
  valid: boolean;
  message: string;
  details: string[];
}

function validateXml(text: string): ValidationResult {
  if (!text.trim()) {
    return { valid: false, message: "Input is empty.", details: ["Provide XML to validate."] };
  }
  const details: string[] = [];
  const opens = (text.match(/<[^/!?][^>]*[^/]>/g) ?? []).filter(
    (t) => !t.endsWith("/>") && !t.startsWith("<?") && !t.startsWith("<!"),
  ).length;
  const closes = (text.match(/<\/[^>]+>/g) ?? []).length;
  const selfClosing = (text.match(/<[^>]+\/>/g) ?? []).length;
  details.push(`${opens} opening tag(s), ${closes} closing tag(s), ${selfClosing} self-closing.`);
  if (opens !== closes) {
    return {
      valid: false,
      message: `Tag mismatch: ${opens} opening vs ${closes} closing tags.`,
      details,
    };
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return {
        valid: false,
        message: "Malformed XML detected.",
        details: [parseError.textContent?.split("\n").slice(0, 2).join(" ") || "Parse error."],
      };
    }
    const root = doc.documentElement;
    details.push(`Root element: <${root.tagName}>.`);
    details.push(`Child element count: ${root.childElementCount}.`);
    return { valid: true, message: "Valid XML document.", details };
  } catch (err) {
    return {
      valid: false,
      message: (err as Error).message || "Unable to parse XML.",
      details,
    };
  }
}

function XmlValidatorTool() {
  const [input, setInput] = useState(
    `<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Flixo</to>\n  <from>User</from>\n</note>`,
  );
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = () => {
    setResult(validateXml(input));
  };

  const handleReset = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          Checks well-formedness, tag balance & structure
        </span>
        <button
          type="button"
          onClick={handleValidate}
          disabled={!input.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <FileCheck2 className="size-3.5" />
          Validate XML
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">XML Input</label>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="<?xml version='1.0'?><root><item>value</item></root>"
          className="w-full h-72 rounded-2xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            result.valid
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-destructive/30 bg-destructive/10"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {result.valid ? (
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-5 text-destructive shrink-0" />
            )}
            <span
              className={`text-sm font-semibold ${
                result.valid ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"
              }`}
            >
              {result.message}
            </span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-1">
            {result.details.map((d, i) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const XmlValidatorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "xml-validator",
  slug: "xml-validator",
  categoryId: "developer",
  icon: FileCheck2,
  component: XmlValidatorTool,
  layoutDescription:
    "Validate XML well-formedness, tag balance, and structure with instant error reporting.",
};
