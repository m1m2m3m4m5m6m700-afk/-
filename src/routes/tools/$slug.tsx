import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";
import { trackPageView } from "@/lib/analytics";

export const Route = createFileRoute("/tools/$slug")({
  component: ToolSlugRoute,
});

function ToolSlugRoute() {
  const { slug } = Route.useParams() as { slug?: string };
  const tool = tools.find((tool) => tool.slug === slug || tool.id === slug);
  const category = tool ? categoryById?.get(tool.categoryId) : undefined;
  const icon = category?.icon ?? Sparkles;
  const categoryName = category?.name ?? "Tools";

  useEffect(() => {
    trackPageView(`/tools/${slug}`);
  }, [slug]);

  // Hidden / non-ready tools are never served at their direct URL — treat the
  // same as a missing tool so stubs and placeholders cannot be reached.
  if (!tool || tool.status !== "ready") {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground">أداة غير موجودة</h1>
          <p className="mt-4 text-muted-foreground">
            لم يتم العثور على الأداة المطلوبة. تأكد من أن `slug` صحيح أو قم بإضافة الأداة إلى سجل
            الأدوات.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <ToolLayout
        icon={icon}
        name={tool.name}
        description={tool.description}
        category={categoryName}
        slug={tool.slug}
      >
        <div className="rounded-3xl border border-border bg-card p-8 space-y-6 text-sm text-muted-foreground">
          <div className="space-y-4">
            <p className="text-base text-foreground font-semibold">هذه صفحة أداة ديناميكية عامة.</p>
            <p>
              الأداة <strong>{tool.name}</strong> مدرجة بحالة <strong>{tool.status}</strong>.
            </p>
            {tool.status === "ready" ? (
              <p>
                تمت إضافة هذه الأداة كجاهزة، ولكن لم يتم إنشاء واجهة مخصصة لها بعد. يمكنك استخدام
                هذه الصفحة كقالب تفاعلي أو إضافة صفحة أداة منفصلة في <code>src/routes/tools</code>{" "}
                لاحقًا.
              </p>
            ) : (
              <p>
                هذه الأداة في طريقها إلى التطبيق ويمكن عرض تفاصيلها هنا. لإضافة 1000 أداة، اضفها إلى
                <code>src/data/tools.ts</code> مع <code>id</code>, <code>name</code>,{" "}
                <code>categoryId</code>,<code>description</code>, <code>status</code>, و{" "}
                <code>slug</code>.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/10 p-5">
            <p className="font-semibold text-foreground">كيف تعمل هذه الصفحة</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-muted-foreground">
              <li>تعرض بيانات الأداة من سجل `src/data/tools.ts`.</li>
              <li>تستخدم فئة الأداة لتحديد اسم الفئة والأيقونة الافتراضية.</li>
              <li>يمكنك إضافة أدوات جديدة دون إنشاء ملف مسار لكل أداة.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              العودة إلى الرئيسية
            </Link>
            {category && (
              <Link
                to="/categories/$slug"
                params={{ slug: category.id }}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                اذهب إلى الفئة
              </Link>
            )}
          </div>
        </div>
      </ToolLayout>
    </SiteLayout>
  );
}
