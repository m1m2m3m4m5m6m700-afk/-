/**
 * Safe Markdown rendering.
 *
 * Markdown is parsed into an AST with the trusted `marked` lexer and rendered
 * directly as typed React nodes. No HTML string is ever produced, so
 * `dangerouslySetInnerHTML` is never needed and React escapes all text by
 * default — `<script>`, `<img onerror=…>`, `<div onclick=…>` and inline HTML
 * are rendered as visible text, never executed.
 *
 * URLs are validated against a strict allowlist so `javascript:`, `data:`
 * and any other dangerous protocol can never reach an `href`/`src`.
 */
import { Fragment, type ReactNode } from "react";
import { marked, type Token, type Tokens } from "marked";

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Normalize and validate a URL. Returns the safe URL string, or `null` when
 * the URL is dangerous (unknown protocol, `javascript:`, `data:`, control
 * characters, or anything that does not cleanly parse).
 *
 * Relative URLs (`/path`, `./x`, `#frag`, `page`) are allowed because they
 * carry no protocol and therefore cannot execute script.
 */
function safeUrl(raw: string): string | null {
  if (typeof raw !== "string") return null;
  // Strip ASCII control chars and whitespace (defeats `java\tscript:`,
  // `java\nscript:` and leading/trailing trimming tricks). Control chars are
  // intentionally targeted — this is a security control, not a typo.
  // eslint-disable-next-line no-control-regex
  const cleaned = raw.replace(/[\u0000-\u001F\u007F-\u009F\s]/g, "");
  if (!cleaned) return null;

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.\\-]*):/.exec(cleaned);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    const full = `${scheme}:${cleaned.slice(schemeMatch[0].length)}`;
    try {
      const parsed = new URL(full);
      if (!SAFE_PROTOCOLS.has(parsed.protocol.toLowerCase())) return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  // Relative reference. Reject anything that looks like an encoded scheme or a
  // backslash (browsers sometimes treat `/\evil` specially).
  if (/[a-z]+:/i.test(cleaned) || cleaned.includes("\\")) return null;
  try {
    const parsed = new URL(cleaned, "https://example.invalid");
    if (parsed.protocol === "https:" && parsed.hostname === "example.invalid") {
      return cleaned;
    }
    return SAFE_PROTOCOLS.has(parsed.protocol.toLowerCase()) ? parsed.href : null;
  } catch {
    return null;
  }
}

function renderInline(tokens: Token[] | undefined): ReactNode {
  if (!tokens || tokens.length === 0) return null;
  return tokens.map((token, i) => {
    const key = `i${i}`;
    switch (token.type) {
      case "text": {
        const t = token as Tokens.Text;
        if (t.tokens && t.tokens.length) {
          return <Fragment key={key}>{renderInline(t.tokens)}</Fragment>;
        }
        return <Fragment key={key}>{t.text}</Fragment>;
      }
      case "strong":
        return (
          <strong key={key} className="font-bold text-foreground">
            {renderInline((token as Tokens.Strong).tokens)}
          </strong>
        );
      case "em":
        return (
          <em key={key} className="italic">
            {renderInline((token as Tokens.Em).tokens)}
          </em>
        );
      case "del":
        return <del key={key}>{renderInline((token as Tokens.Del).tokens)}</del>;
      case "codespan":
        return (
          <code key={key} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
            {(token as Tokens.Codespan).text}
          </code>
        );
      case "br":
        return <br key={key} />;
      case "link": {
        const link = token as Tokens.Link;
        const href = safeUrl(link.href);
        if (!href) {
          return <Fragment key={key}>{renderInline(link.tokens) ?? link.text}</Fragment>;
        }
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {renderInline(link.tokens) ?? link.text}
          </a>
        );
      }
      case "image": {
        const img = token as Tokens.Image;
        const src = safeUrl(img.href);
        if (!src) return <Fragment key={key}>{renderInline(img.tokens) ?? img.text}</Fragment>;
        return (
          <img
            key={key}
            src={src}
            alt={img.text || ""}
            title={img.title ?? undefined}
            className="max-w-full h-auto rounded"
            loading="lazy"
            decoding="async"
          />
        );
      }
      // Raw inline HTML is dropped — never rendered, never executed.
      case "html":
        return null;
      case "escape":
        return <Fragment key={key}>{(token as Tokens.Escape).text}</Fragment>;
      default: {
        const g = token as Tokens.Generic;
        const text = typeof g.text === "string" ? g.text : "";
        return text ? <Fragment key={key}>{text}</Fragment> : null;
      }
    }
  });
}

/**
 * Render a Markdown string into safe React nodes. Any lexer error is swallowed
 * and an empty fragment is returned — markdown must never break the page.
 */
export function renderMarkdownToReact(md: string): ReactNode {
  if (!md) return null;
  let tokens: Token[];
  try {
    tokens = marked.lexer(md);
  } catch {
    return null;
  }
  return <>{tokens.map((token, i) => mapBlock(token, `b${i}`))}</>;
}

function mapBlock(token: Token, key: string): ReactNode {
  switch (token.type) {
    case "heading": {
      const h = token as Tokens.Heading;
      const content = renderInline(h.tokens) ?? h.text;
      switch (h.depth) {
        case 1:
          return (
            <h1 key={key} className="text-2xl font-bold text-foreground mt-5 mb-3">
              {content}
            </h1>
          );
        case 2:
          return (
            <h2 key={key} className="text-xl font-bold text-foreground mt-4 mb-2">
              {content}
            </h2>
          );
        case 3:
          return (
            <h3 key={key} className="text-lg font-bold text-foreground mt-3 mb-1">
              {content}
            </h3>
          );
        case 4:
          return (
            <h4 key={key} className="text-base font-bold text-foreground mt-2 mb-1">
              {content}
            </h4>
          );
        case 5:
          return (
            <h5 key={key} className="text-sm font-bold text-foreground mt-2 mb-1">
              {content}
            </h5>
          );
        default:
          return (
            <h6 key={key} className="text-xs font-bold text-foreground mt-2 mb-1">
              {content}
            </h6>
          );
      }
    }
    case "paragraph":
      return (
        <p key={key} className="my-2 leading-relaxed">
          {renderInline((token as Tokens.Paragraph).tokens)}
        </p>
      );
    case "space":
      return null;
    case "hr":
      return <hr key={key} className="my-4 border-border" />;
    case "blockquote": {
      const bq = token as Tokens.Blockquote;
      return (
        <blockquote
          key={key}
          className="my-2 pl-4 border-l-4 border-border italic text-muted-foreground"
        >
          {bq.tokens.map((t, i) => mapBlock(t, `${key}-${i}`))}
        </blockquote>
      );
    }
    case "code": {
      const code = token as Tokens.Code;
      return (
        <pre key={key} className="my-3 overflow-x-auto rounded-xl bg-muted p-4 text-xs font-mono">
          <code>{code.text}</code>
        </pre>
      );
    }
    case "list": {
      const list = token as Tokens.List;
      const items = list.items.map((item, idx) => (
        <li key={`li${key}${idx}`} className="ml-4 text-muted-foreground">
          {item.task ? (
            <>
              <input
                type="checkbox"
                checked={!!item.checked}
                readOnly
                disabled
                className="mr-2 align-middle"
              />
              {renderInline(item.tokens)}
            </>
          ) : (
            (renderInline(item.tokens) ?? item.text)
          )}
        </li>
      ));
      const listClass = "my-2 space-y-1";
      if (list.ordered) {
        return (
          <ol key={key} className={`${listClass} list-decimal`}>
            {items}
          </ol>
        );
      }
      return (
        <ul key={key} className={`${listClass} list-disc`}>
          {items}
        </ul>
      );
    }
    case "table": {
      const table = token as Tokens.Table;
      return (
        <div key={key} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {table.header.map((cell, ci) => (
                  <th
                    key={`th${key}${ci}`}
                    className="border border-border px-2 py-1 text-left font-semibold"
                    style={cell.align ? { textAlign: cell.align } : undefined}
                  >
                    {renderInline(cell.tokens)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={`tr${key}${ri}`}>
                  {row.map((cell, ci) => (
                    <td
                      key={`td${key}${ri}-${ci}`}
                      className="border border-border px-2 py-1"
                      style={cell.align ? { textAlign: cell.align } : undefined}
                    >
                      {renderInline(cell.tokens)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Raw block HTML (`<div>`, `<script>`…) is dropped entirely.
    case "html":
      return null;
    default: {
      const g = token as Tokens.Generic;
      const text = typeof g.text === "string" ? g.text : "";
      return text ? <p key={key}>{text}</p> : null;
    }
  }
}
