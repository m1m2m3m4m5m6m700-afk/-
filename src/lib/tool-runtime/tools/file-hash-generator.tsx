import { useState } from "react";
import { Hash, Copy, Check, Upload, FileText, ShieldCheck } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

async function computeHash(buffer: ArrayBuffer, algo: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function FileHashGeneratorTool() {
  const [textInput, setTextInput] = useState("Flixo Security Tools");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{ sha1?: string; sha256?: string; sha512?: string }>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  const handleComputeHashes = async () => {
    setIsCalculating(true);
    try {
      let buffer: ArrayBuffer;
      if (file) {
        buffer = await file.arrayBuffer();
      } else {
        buffer = new TextEncoder().encode(textInput).buffer;
      }

      const [sha1, sha256, sha512] = await Promise.all([
        computeHash(buffer, "SHA-1"),
        computeHash(buffer, "SHA-256"),
        computeHash(buffer, "SHA-512"),
      ]);

      setHashes({ sha1, sha256, sha512 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCopy = (hashVal: string, algo: string) => {
    navigator.clipboard.writeText(hashVal);
    setCopiedAlgo(algo);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-foreground">Text Input or File</label>
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setFile(null);
            }}
            placeholder="Type text to generate cryptographic hashes..."
            className="w-full h-28 rounded-2xl border border-border bg-background p-4 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />

          <div className="rounded-2xl border border-dashed border-border p-4 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
            <input
              type="file"
              id="hash-file-upload"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="hash-file-upload"
              className="cursor-pointer flex flex-col items-center gap-1"
            >
              <Upload className="size-6 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {file ? file.name : "Or click to upload file for hashing"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : "Supports any file format (calculated 100% locally)"}
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleComputeHashes}
            disabled={isCalculating}
            className="w-full py-3 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Hash className="size-4" />
            {isCalculating ? "Calculating Hashes..." : "Generate Cryptographic Hashes"}
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-foreground">Generated Hashes</label>
          <div className="space-y-3">
            {[
              { label: "SHA-256", key: "sha256", val: hashes.sha256 },
              { label: "SHA-1", key: "sha1", val: hashes.sha1 },
              { label: "SHA-512", key: "sha512", val: hashes.sha512 },
            ].map(({ label, key, val }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-background p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{label}</span>
                  {val && (
                    <button
                      type="button"
                      onClick={() => handleCopy(val, key)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {copiedAlgo === key ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copiedAlgo === key ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <div className="font-mono text-[11px] text-foreground break-all">
                  {val || (
                    <span className="text-muted-foreground/40 italic">Hash will appear here</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/10 p-3 flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Hashes are calculated locally via the Web Crypto API. Your files never leave your
              browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const FileHashGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "file-hash-generator",
  slug: "file-hash-generator",
  categoryId: "files",
  icon: Hash,
  component: FileHashGeneratorTool,
  layoutDescription:
    "Calculate SHA-256, SHA-1, and SHA-512 cryptographic hashes for text or uploaded files.",
};
