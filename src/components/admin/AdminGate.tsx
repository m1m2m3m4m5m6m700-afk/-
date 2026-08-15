import { useState } from "react";
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/lib/admin";

interface AdminGateProps {
  children: React.ReactNode;
  areaLabel: string;
}

export function AdminGate({ children, areaLabel }: AdminGateProps) {
  const { loading, status, error, setupOwner, login, logout } = useAdminAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !status) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5 py-20 text-center lg:px-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm">جارٍ التحقق من جلسة الإدارة…</p>
        </div>
      </div>
    );
  }

  const handleSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !password || password.length < 10 || password !== passwordConfirm || submitting) return;
    setSubmitting(true);
    const ok = await setupOwner(name, email, password);
    setSubmitting(false);
    if (ok) {
      setName(""); setEmail(""); setPassword(""); setPasswordConfirm("");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    await login(password);
    setSubmitting(false);
  };

  if (status.setupRequired) {
    return (
      <div dir="rtl" className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-5 py-20 lg:px-8">
        <div className="w-full space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-xl">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></div>
            <h1 className="text-2xl font-bold text-foreground">إعداد حساب المالك</h1>
            <p className="text-sm text-muted-foreground">هذا التسجيل يظهر مرة واحدة فقط. الحساب الأول يصبح مالك Flixo ومدير النظام.</p>
          </div>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="owner-name">الاسم</Label><Input id="owner-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المالك" autoComplete="name" required className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label htmlFor="owner-email">البريد الإلكتروني</Label><Input id="owner-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" autoComplete="email" required className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label htmlFor="owner-password">كلمة المرور</Label><div className="relative"><Input id="owner-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="10 أحرف على الأقل" autoComplete="new-password" required minLength={10} className="rounded-xl ps-10" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
            <div className="space-y-1.5"><Label htmlFor="owner-password-confirm">تأكيد كلمة المرور</Label><Input id="owner-password-confirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="أعد كتابة كلمة المرور" autoComplete="new-password" required minLength={10} className="rounded-xl" /></div>
            {password && passwordConfirm && password !== passwordConfirm && <p className="text-xs text-rose-500">كلمتا المرور غير متطابقتين.</p>}
            {error && <p className="text-xs text-rose-500 flex items-center gap-1.5"><AlertCircle className="size-3.5" />{error}</p>}
            <Button type="submit" disabled={submitting || !name || !email || password.length < 10 || password !== passwordConfirm} className="w-full rounded-xl font-bold">{submitting ? <><Loader2 className="me-2 size-4 animate-spin" />جارٍ إنشاء الحساب…</> : <>إنشاء حساب المالك</>}</Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground">بعد إنشاء الحساب يُغلق التسجيل الأول نهائيًا، ولا يتم تخزين كلمة المرور بصورتها الأصلية.</p>
        </div>
      </div>
    );
  }

  if (!status.authenticated) {
    return (
      <div dir="rtl" className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-5 py-20 lg:px-8">
        <div className="w-full space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-xl">
          <div className="space-y-2 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-6" /></div><h1 className="text-2xl font-bold text-foreground">تسجيل دخول المالك</h1><p className="text-xs text-muted-foreground">{areaLabel} — منطقة خاصة بمالك Flixo.</p></div>
          <form onSubmit={handleLogin} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="admin-password" className="flex items-center gap-1.5"><KeyRound className="size-3.5 text-primary" />كلمة مرور المالك</Label><Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" autoComplete="current-password" autoFocus required className="rounded-xl" /></div>{error && <p className="text-xs text-rose-500 flex items-center gap-1.5"><AlertCircle className="size-3.5" />{error}</p>}<Button type="submit" disabled={submitting || !password} className="w-full rounded-xl font-bold">{submitting ? <><Loader2 className="me-2 size-4 animate-spin" />جارٍ الدخول…</> : <><Lock className="me-2 size-4" />تسجيل الدخول</>}</Button></form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" dir="rtl">
      <div className="absolute start-0 top-0 z-10 hidden sm:block"><Button variant="ghost" size="sm" onClick={() => void logout()} className="rounded-xl text-xs font-semibold text-muted-foreground">تسجيل الخروج</Button></div>
      {children}
    </div>
  );
}
