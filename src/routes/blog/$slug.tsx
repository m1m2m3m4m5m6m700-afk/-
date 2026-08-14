import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { getBlogPost } from "@/data/blogData";
import { tools } from "@/data/tools";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { usePageSeo } from "@/lib/usePageSeo";
import { trackPageView } from "@/lib/analytics";
import { SITE_URL } from "@/lib/seo/site";
import { useI18n } from "@/lib/i18n";
import { resolveToolName } from "@/lib/i18n/keys";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const post = getBlogPost(slug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  usePageSeo(undefined, {
    title: post ? `${post.title} | Flixo Blog` : "Article Not Found | Flixo",
    description: post?.metaDescription || "Read AI tool and web utility guides on Flixo.",
    keywords: post?.keywords || ["flixo blog", "ai tools"],
  });

  useEffect(() => {
    trackPageView(`/blog/${slug}`);
  }, [slug]);

  if (!post) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The requested blog article does not exist or has been moved.
          </p>
          <Link to="/blog" className="mt-4 inline-block font-semibold text-primary underline">
            Back to Blog Index
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // Related Flixo Tools matching post.relatedToolIds
  const relatedTools = tools.filter((t) => post.relatedToolIds.includes(t.id));

  // Schemas
  const siteUrl = SITE_URL;
  const pageUrl = `${siteUrl}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishDate,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Flixo",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.svg`,
      },
    },
    mainEntityOfPage: pageUrl,
  };

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
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = post.faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <SiteLayout>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="bg-hero-glow min-h-screen">
        <article className="mx-auto max-w-4xl px-5 pb-20 pt-10 md:pt-14 space-y-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex items-center flex-wrap gap-1.5">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
              </li>
              <li
                className="font-semibold text-foreground truncate max-w-[200px]"
                aria-current="page"
              >
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="space-y-4">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {post.category}
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/60 pb-4">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="size-3.5 text-primary" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {post.publishDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readTime}
              </span>
            </div>
          </header>

          {/* AI Search Key Takeaways Box */}
          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="size-4" />
              Key Takeaways & Summary
            </div>
            <p className="text-sm leading-relaxed text-foreground font-medium">{post.summary}</p>
          </section>

          {/* Article Body Content */}
          <section className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base leading-relaxed space-y-4">
            {post.content.split("\n\n").map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className="text-xl font-bold tracking-tight mt-8 mb-3 text-foreground"
                  >
                    {trimmed.replace("## ", "")}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={index}
                    className="text-lg font-bold tracking-tight mt-6 mb-2 text-foreground"
                  >
                    {trimmed.replace("### ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ")) {
                const items = trimmed.split("\n- ");
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split("\n");
                return (
                  <ol key={index} className="list-decimal pl-5 space-y-2 text-muted-foreground">
                    {items.map((item, i) => (
                      <li key={i}>{item.replace(/^\d+\.\s*/, "")}</li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
          </section>

          {/* Related Flixo Tools Callout Grid (Mandatory Requirement: Article links to tools) */}
          {relatedTools.length > 0 && (
            <section className="rounded-3xl border border-border/80 bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Try Related Flixo Tools</h3>
                  <p className="text-xs text-muted-foreground">
                    Launch these browser-based tools mentioned in this guide with zero setup.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((tool) => {
                  const isReady = tool.status === "ready" && tool.slug;
                  return (
                    <Link
                      key={tool.id}
                      to={(isReady ? `/tools/${tool.slug}` : "/#categories") as never}
                      className="group rounded-2xl border border-border/60 bg-surface/50 p-4 transition-all hover:border-primary/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {resolveToolName(tool.slug || tool.id, t)}
                          </span>
                          <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-transform" />
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          #{tool.categoryId}
                        </span>
                        <span className="text-[10px] font-bold text-primary">Use Tool →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* FAQ Accordions if present */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight">Article FAQ</h3>
              </div>
              <div className="space-y-3">
                {post.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border/80 bg-surface/30 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground focus:outline-none"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`size-4 shrink-0 transition-transform ${
                            isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-border/50 px-4 pb-4 pt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </SiteLayout>
  );
}
