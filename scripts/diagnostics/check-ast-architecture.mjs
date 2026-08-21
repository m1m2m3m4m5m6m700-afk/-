import ts from "typescript";
import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";

const BANNED_COMPONENT_IMPORTS = [/services\/providers(?:\/|$)/, /scripts\/diagnostics(?:\/|$)/, /(?:^|\/)server(?:\/|$)/, /(?:^|\/)api(?:\/|$)/];
const DOM_MODULES = new Set(["react-dom", "react-dom/client", "@testing-library/dom", "jsdom"]);

function moduleViolations(file, source) {
  const findings = [];
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const spec = node.moduleSpecifier.text;
      if ((file.includes("/components/") || file.includes("/pages/")) && BANNED_COMPONENT_IMPORTS.some((pattern) => pattern.test(spec))) {
        findings.push(`${rel(file)}: UI layer bypasses AIService/RPC boundary via ${spec}`);
      }
      if (file.includes("scripts/diagnostics/") && DOM_MODULES.has(spec)) {
        findings.push(`${rel(file)}: diagnostic scanner imports client DOM module ${spec}`);
      }
    }
    if (file.includes("scripts/diagnostics/") && (node.kind === ts.SyntaxKind.Identifier) && (node.text === "window" || node.text === "document")) {
      findings.push(`${rel(file)}: diagnostic scanner references browser global ${node.text}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return findings;
}

await main("check-ast-architecture", () => {
  const findings = [];
  for (const file of files("src", /\.(ts|tsx)$/)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    findings.push(...moduleViolations(file, source));
  }
  for (const file of files("scripts/diagnostics", /\.(mjs|ts|tsx)$/)) {
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    findings.push(...moduleViolations(file, source));
  }
  return {
    severity: findings.length ? "CRITICAL" : "INFO",
    message: findings.length ? "AST architecture boundary violations detected" : "AST architecture boundary PASS",
    findings,
    details: { uiBoundary: "components/pages -> AIService/RPC only", diagnosticsBoundary: "Node-only; no browser DOM dependencies" },
  };
});
