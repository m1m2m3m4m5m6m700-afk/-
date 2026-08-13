/**
 * Admin login + access gate.
 *
 * This is the AUTHENTICATION surface for the admin area. It is intentionally
 * separate from the data dashboards so that authorization is enforced before
 * any admin UI (or admin data) renders.
 *
 * States:
 *   - loading          → spinner (server is the source of truth for the
 *                         HttpOnly session cookie; we can't know client-side)
 *   - not configured    → honest "not configured" message (NEVER a fake login
 *                         that lets anyone in). The operator must set
 *                         ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET.
 *   - authenticated     → renders `children` (the protected dashboard)
 *   - unauthenticated   → password form (sets the signed HttpOnly cookie via
 *                         the adminLogin RPC)
 *
 * Note on "hidden access trigger": there is no secret URL or click/keyboard
 * trick that grants access. The route is always reachable; AUTHORIZATION is
 * the signed cookie, not obscurity. (A DEV-only discovery hint could be added
 * by the operator, but it is never authorization.)
 */

import { useState } from "react";
import { Lock, ShieldCheck, Loader2, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/lib/admin";

interface AdminGateProps {
  /** Rendered only when the caller is authenticated + authorized. */
  children: React.ReactNode;
  /** Title shown on the login screen + access-denied header. */
  areaLabel: string;
}

export function AdminGate({ children, areaLabel }: AdminGateProps) {
  const { loading, status, error, login, logout } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading || !status) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5 py-20 text-center lg:px-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary" />
          <p className="text-sm">Verifying admin session…</p>
        </div>
      </div>
    );
  }

  // Not configured on the server: be honest, never fake a login.
  if (!status.configured) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5 py-20 text-center lg:px-8">
        <div className="space-y-3 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Admin not configured</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Admin authentication is disabled because the server has not been configured with admin
            credentials. The operator must set <code>ADMIN_PASSWORD_HASH</code> and{" "}
            <code>ADMIN_SESSION_SECRET</code> before this area can be used. No data is exposed.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated + authorized → render the protected surface.
  if (status.authenticated && status.role === "admin") {
    return (
      <div className="relative">
        <div className="absolute right-0 top-0 z-10 hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void logout()}
            className="rounded-xl text-xs font-semibold text-muted-foreground"
          >
            <Lock className="me-1.5 size-3.5" />
            Sign out
          </Button>
        </div>
        {children}
      </div>
    );
  }

  // Unauthenticated → login form. This is the AUTHORIZATION gate.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    const ok = await login(password);
    setSubmitting(false);
    if (ok) {
      setPassword("");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-5 py-20 lg:px-8">
      <div className="w-full space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin sign in</h1>
          <p className="text-xs text-muted-foreground">
            {areaLabel} requires administrator authentication.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password" className="text-xs font-bold flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-primary" />
              Admin password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
                required
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={submitting || !password}
            className="w-full rounded-xl font-bold"
          >
            {submitting ? (
              <>
                <Loader2 className="me-2 size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Lock className="me-2 size-4" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground">
          The session is stored in a signed, HttpOnly cookie. The password is verified server-side
          and never sent back.
        </p>
      </div>
    </div>
  );
}
