import { useState } from "react";
import { Globe, Copy, Check, Download, Eye } from "lucide-react";
import type { ReadyToolRuntimeDefinition } from "../types";

function MetaTagGeneratorTool() {
  const [title, setTitle] = useState("Flixo — Online Productivity & Developer Tools");
  const [description, setDescription] = useState(
    "Fast, free, and private online tools running directly inside your browser.",
  );
  const [keywords, setKeywords] = useState(
    "flixo, online tools, developer tools, pdf tools, image tools",
  );
  const [author, setAuthor] = useState("Flixo");
  const [url, setUrl] = useState("https://flixo.app");
  const [ogImage, setOgImage] = useState("https://flixo.app/og-image.png");
  const [copied, setCopied] = useState(false);

  const generatedTags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImage}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${ogImage}">`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedTags], { type: "text/html" });
    const fileUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = "meta-tags.html";
    a.click();
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Site Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Canonical URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Meta Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Keywords (comma separated)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Open Graph Image URL</label>
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Eye className="size-3.5 text-primary" />
          Google Search Snippet Preview
        </h4>
        <div className="p-4 rounded-2xl border border-border bg-background space-y-1">
          <div className="text-xs text-muted-foreground truncate">{url}</div>
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate">
            {title}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">Generated Meta HTML Tags</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied HTML" : "Copy HTML"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <Download className="size-3.5" />
              Download
            </button>
          </div>
        </div>

        <div className="h-48 rounded-2xl border border-border bg-background p-4 overflow-y-auto font-mono text-xs whitespace-pre">
          {generatedTags}
        </div>
      </div>
    </div>
  );
}

export const MetaTagGeneratorRuntime: ReadyToolRuntimeDefinition = {
  toolId: "meta-tag-generator",
  slug: "meta-tag-generator",
  categoryId: "web",
  icon: Globe,
  component: MetaTagGeneratorTool,
  layoutDescription:
    "Generate complete SEO meta tags, OpenGraph tags, and Twitter Cards with Google snippet preview.",
};
