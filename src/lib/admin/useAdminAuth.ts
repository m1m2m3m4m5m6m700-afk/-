import { useCallback, useEffect, useState } from "react";
import { adminLogin, adminLogout, adminSetup, getAdminAuthStatus } from "./rpc/auth.rpc";
import type { AdminAuthStatus, AdminLoginResult, AdminSetupResult } from "./types";

export interface UseAdminAuthState {
  loading: boolean;
  status: AdminAuthStatus | null;
  error: string | null;
}

export interface UseAdminAuthApi extends UseAdminAuthState {
  refreshStatus: () => Promise<void>;
  setupOwner: (name: string, email: string, password: string) => Promise<boolean>;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthApi {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AdminAuthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await getAdminAuthStatus());
    } catch {
      setError("تعذر الاتصال بخادم Flixo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refreshStatus(); }, [refreshStatus]);

  const setupOwner = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const res = (await adminSetup({ data: { name, email, password } })) as AdminSetupResult;
      if (!res.ok) { setError(res.message); return false; }
      await refreshStatus();
      return true;
    } catch {
      setError("تعذر إنشاء حساب المالك.");
      return false;
    }
  }, [refreshStatus]);

  const login = useCallback(async (password: string) => {
    setError(null);
    try {
      const res = (await adminLogin({ data: { password } })) as AdminLoginResult;
      if (res.ok) { await refreshStatus(); return true; }
      setError(res.message);
      return false;
    } catch {
      setError("تعذر تسجيل الدخول.");
      return false;
    }
  }, [refreshStatus]);

  const logout = useCallback(async () => {
    setError(null);
    try { await adminLogout(); await refreshStatus(); }
    catch { setError("تعذر تسجيل الخروج."); }
  }, [refreshStatus]);

  return { loading, status, error, refreshStatus, setupOwner, login, logout };
}
