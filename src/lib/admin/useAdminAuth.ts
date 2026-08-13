/**
 * Client hook for admin authentication.
 *
 * Thin wrapper around the server RPCs in `./rpc/auth.rpc`. Imports ONLY types +
 * RPC fetchers — no config, no secrets, no server code. Safe for the client
 * bundle (the cookie is HttpOnly and never readable by JS).
 *
 * Mirrors the shape of the GitHub `useGitHub` hook's auth portion.
 */

import { useCallback, useEffect, useState } from "react";
import { adminLogin, adminLogout, getAdminAuthStatus } from "./rpc/auth.rpc";
import type { AdminAuthStatus, AdminLoginResult } from "./types";

export interface UseAdminAuthState {
  loading: boolean;
  status: AdminAuthStatus | null;
  error: string | null;
}

export interface UseAdminAuthApi extends UseAdminAuthState {
  refreshStatus: () => Promise<void>;
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
      const s = await getAdminAuthStatus();
      setStatus(s);
    } catch {
      setError("Could not reach the Flixo server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status once on mount (the cookie is HttpOnly, so the server is
  // the only source of truth for whether the session is valid).
  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      setError(null);
      try {
        // adminLogin returns a Response (Set-Cookie) on success whose JSON body
        // is `{ ok: true }`; on failure it returns a plain failure object. The
        // TanStack client resolves both to a parsed object, so `res.ok` works.
        const res = (await adminLogin({ data: { password } })) as AdminLoginResult;
        if (res.ok) {
          await refreshStatus();
          return true;
        }
        setError(res.message);
        return false;
      } catch {
        setError("Could not sign in.");
        return false;
      }
    },
    [refreshStatus],
  );

  const logout = useCallback(async () => {
    setError(null);
    try {
      await adminLogout();
      await refreshStatus();
    } catch {
      setError("Could not sign out.");
    }
  }, [refreshStatus]);

  return { loading, status, error, refreshStatus, login, logout };
}
