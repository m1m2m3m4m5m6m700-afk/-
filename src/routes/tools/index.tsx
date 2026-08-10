import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndexRoute,
});

function ToolsIndexRoute() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground">الأدوات</h1>
        <p className="mt-4 text-muted-foreground">
          هذه الصفحة مخصصة للانتقال عبر مساعد Flixo. استخدم الصفحة الرئيسية للوصول إلى المساعد
          واكتشاف الأدوات.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </SiteLayout>
  );
}
