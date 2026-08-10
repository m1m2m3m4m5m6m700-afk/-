import { useMemo, useState } from "react";
import { Table2, Copy, Check, RotateCcw, Download, Plus, Trash2 } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function MarkdownTableGeneratorTool() {
  const [headers, setHeaders] = useState<string[]>(["Name", "Type", "Value"]);
  const [rows, setRows] = useState<string[][]>([
    ["Flixo", "Tool", "1.0"],
    ["Translator", "Utility", "2.6"],
  ]);
  const [copied, setCopied] = useState(false);

  const updateHeader = (index: number, value: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? value : h)));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setRows((prev) =>
      prev.map((row, ri) =>
        ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row,
      ),
    );
  };

  const addColumn = () => {
    setHeaders((prev) => [...prev, "Column"]);
    setRows((prev) => prev.map((row) => [...row, ""]));
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    setHeaders((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  };

  const addRow = () => setRows((prev) => [...prev, headers.map(() => "")]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const escapeCell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");

  const generated = useMemo(() => {
    const head = `| ${headers.map(escapeCell).join(" | ")} |`;
    const sep = `| ${headers.map(() => "---").join(" | ")} |`;
    const body = rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`).join("\n");
    return [head, sep, body].filter(Boolean).join("\n");
  }, [headers, rows]);

  const handleCopy = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setHeaders(["Column 1"]);
    setRows([[""]]);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Table Editor</label>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <Plus className="size-3.5" />
            Add column
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                {headers.map((header, i) => (
                  <th key={i} className="p-2 border-b border-border">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(i, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2 py-1 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder={`Column ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(i)}
                        disabled={headers.length <= 1}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="p-2 align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(ri)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
        >
          <Plus className="size-3.5" />
          Add row
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Markdown Output</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Download className="size-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
          </div>
        </div>
        <pre className="rounded-2xl border border-border bg-background p-4 overflow-auto font-mono text-xs text-foreground min-h-[8rem] whitespace-pre-wrap">
          {generated}
        </pre>
      </div>
    </div>
  );
}

export const MarkdownTableGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "markdown-table-generator",
  slug: "markdown-table-generator",
  categoryId: "developer",
  icon: Table2,
  component: MarkdownTableGeneratorTool,
  layoutDescription:
    "Build Markdown tables visually and export ready-to-paste pipe-formatted output.",
};
