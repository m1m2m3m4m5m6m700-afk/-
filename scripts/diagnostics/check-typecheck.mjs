import * as ts from "typescript";
import { readFileSync } from "node:fs";
import { main, files, rel } from "./_core.mjs";

await main("check-typecheck", () => {
  const findings = [];
  for (const file of files("src", /\.(ts|tsx)$/)) {
    const sourceText = readFileSync(file, "utf8");
    const source = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);

    function visit(node) {
      if (node.kind === ts.SyntaxKind.AnyKeyword) findings.push(`${rel(file)}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: explicit any type`);
      ts.forEachChild(node, visit);
    }
    visit(source);

    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, sourceText);
    let token;
    do {
      token = scanner.scan();
      if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
        const comment = scanner.getTokenText();
        if (/^\/\/\s*@ts-(?:ignore|nocheck)\b|^\/\*[\s\S]*@ts-(?:ignore|nocheck)\b/i.test(comment)) {
          findings.push(`${rel(file)}:${source.getLineAndCharacterOfPosition(scanner.getTokenPos()).line + 1}: TypeScript suppression directive`);
        }
      }
    } while (token !== ts.SyntaxKind.EndOfFileToken);
  }
  return { severity: findings.length ? "CRITICAL" : "INFO", message: findings.length ? "AST TypeScript hygiene violations detected" : "AST typecheck hygiene PASS", findings };
});
