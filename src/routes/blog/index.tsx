import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { blogPosts } from "@/data/blogData";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexRoute,
});

function BlogIndexRoute() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  usePageSeo(undefined, {
    title: "Flixo Blog — AI Tools, Privacy & Web Utility Guides",
    description:
      "Articles, guides, and tutorials on browser-based AI tools, super-resolution photo enhancement, privacy-first translation, and cryptographic security.",
    keywords: [
      "flixo blog",
      "ai tool guides",
      "image enhancer tutorial",
      "privacy tools blog",
      "developer utilities blog",
    ],
  });

  useEffect(() => {
    trackPageView("/blog");
  }, []);

  const categories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

  const filteredPosts =
    selectedCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === selectedCategory);

  const siteUrl = "https://flixotools.com";
  const blogUrl = `${siteUrl}/blog`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: blogUrl,
      },
    ],
  };

  return (
    <SiteLayout>
      <JsonLd data={breadcrumbSchema} />

      <div className="bg-hero-glow min-h-screen">
        <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li className="font-semibold text-foreground" aria-current="page">
                Blog
              </li>
            </ol>
          </nav>

          {/* Hero Header */}
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="size-3.5" />
              Flixo Knowledge Base & Insights
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              AI Tools & Web Utility Guides
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              In-depth articles explaining browser-based neural processing, photo restoration
              algorithms, privacy architecture, and cryptographic security.
            </p>
          </header>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/80 bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-3xl border border-border/80 bg-card/80 p-6 shadow-xs transition-all hover:border-primary/50 hover:shadow-lift flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Tag className="size-3" />
                      {post.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {post.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">By {post.author}</span>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    Read Article <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
