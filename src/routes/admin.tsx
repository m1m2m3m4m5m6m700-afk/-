import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BrainCircuit, ClipboardCheck, Inbox, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AdminGate } from "@/components/admin/AdminGate";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "إدارة Flixo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminHubRoute,
});

function AdminHubRoute() {
  return (
    <SiteLayout>
      <AdminGate areaLabel="لوحة إدارة Flixo">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6" dir="rtl">
          <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">لوحة إدارة Flixo</h1>
                <p className="mt-1 text-sm text-muted-foreground">مركز التحكم الخاص بالمالك لمتابعة نشاط الموقع والأدوات والرسائل والاستبيانات ومراجعة الجودة.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link to="/admin/analytics" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <BarChart3 className="size-5 text-primary" /><h2 className="mt-4 font-bold">الإحصاءات</h2><p className="mt-1 text-xs text-muted-foreground">زيارات الصفحات والبحث والأدوات والأجهزة والمصادر والأحداث الأخيرة.</p>
              </Link>
              <Link to="/admin/behavior" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <BrainCircuit className="size-5 text-primary" /><h2 className="mt-4 font-bold">السلوك والاستبيانات</h2><p className="mt-1 text-xs text-muted-foreground">رحلات الزوار والنقرات ونية البحث والاستبيانات ومسارات الاستخدام.</p>
              </Link>
              <Link to="/admin/tools-review" className="rounded-2xl border border-primary/20 bg-primary/5 p-5 transition hover:border-primary/40 hover:bg-primary/10">
                <ClipboardCheck className="size-5 text-primary" /><h2 className="mt-4 font-bold">مراجعة الأدوات</h2><p className="mt-1 text-xs text-muted-foreground">اختبر كل أداة فعليًا ثم ضع النجمة. عدم وجود النجمة يعني أنها لم تُراجع بعد.</p>
              </Link>
              <Link to="/admin/inbox" className="rounded-2xl border border-border/70 bg-surface/30 p-5 transition hover:border-primary/40 hover:bg-primary/5">
                <Inbox className="size-5 text-primary" /><h2 className="mt-4 font-bold">صندوق المالك</h2><p className="mt-1 text-xs text-muted-foreground">محادثات الزوار والطلبات والردود الخاصة بالمالك.</p>
              </Link>
            </div>
            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-muted-foreground">وضع الخصوصية مفعل: لا يتم عرض أو حفظ بيانات حساسة غير لازمة داخل طبقة التحليلات.</div>
          </div>
        </div>
      </AdminGate>
    </SiteLayout>
  );
}
