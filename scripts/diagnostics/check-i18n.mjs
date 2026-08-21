import * as ts from "typescript";
import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";

const WRAPPER_NAMES = new Set(["Trans", "Localized", "I18n", "I18nText", "Translate"]);
const ALLOWED_SHORT_TEXT = new Set(["or", "to", "of", "in", "on", "at", "QR", "PDF", "AI", "OK"]);

function isInsideTranslationWrapper(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) {
      const tag = current.openingElement?.tagName ?? current.tagName;
      if (tag && ts.isIdentifier(tag) && WRAPPER_NAMES.has(tag.text)) return true;
    }
  }
  return false;
}

await main("check-i18n", () => {
  const findings = [];
  for (const file of files("src", /\.(tsx|jsx)$/)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxText(node) && !isInsideTranslationWrapper(node)) {
        const value = node.getText(source).replace(/\s+/g, " ").trim();
        const meaningful = /[A-Za-z]{3,}|[\u0600-\u06FF]{2,}/.test(value);
        if (meaningful && !ALLOWED_SHORT_TEXT.has(value)) {
          const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
          findings.push(`${rel(file)}:${line}: hardcoded JSX text: ${value.slice(0, 80)}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  return {
    severity: findings.length ? "WARNING" : "INFO",
    message: findings.length ? "AST i18n advisory findings detected" : "AST i18n surface PASS",
    findings,
    details: { policy: "advisory; use localization validators for release blocking" },
  };
});
