import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  createOwnerAccount,
  hasOwnerAccount,
  isAdminConfiguredAsync,
} from "../config";
import { hashAdminPassword, verifyAdminPassword } from "../server/password";
import {
  buildAdminClearCookieHeader,
  buildAdminSetCookieHeader,
  createAdminSessionValue,
} from "../server/session";
import { adminSessionMiddleware } from "../auth/adminSession";
import type { AdminAuthStatus, AdminLoginResult, AdminSetupResult } from "../types";

export const getAdminAuthStatus = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .handler(async ({ context }): Promise<AdminAuthStatus> => {
    const configured = await isAdminConfiguredAsync();
    return {
      configured,
      authenticated: context.adminSession !== null,
      role: context.adminSession?.role ?? null,
      setupRequired: !configured,
    };
  });

/** First-run owner registration. The DB singleton constraint allows exactly one owner. */
export const adminSetup = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(320),
      password: z.string().min(10).max(1024),
    }),
  )
  .handler(async ({ data }): Promise<AdminSetupResult> => {
    if (await isAdminConfiguredAsync()) {
      return { ok: false, kind: "setup_unavailable", message: "تم إعداد حساب المالك بالفعل." };
    }
    const passwordHash = hashAdminPassword(data.password);
    const sessionSecret = randomBytes(48).toString("base64url");
    const created = await createOwnerAccount({
      name: data.name,
      email: data.email,
      passwordHash,
      sessionSecret,
    });
    if (!created) {
      if (await hasOwnerAccount()) {
        return { ok: false, kind: "setup_unavailable", message: "تم إعداد حساب المالك بالفعل." };
      }
      return {
        ok: false,
        kind: "setup_unavailable",
        message: "لا يمكن إكمال الإعداد حاليًا. تأكد من تفعيل قاعدة البيانات ثم أعد المحاولة.",
      };
    }
    return { ok: true };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1).max(1024) }))
  .handler(async ({ data }): Promise<AdminLoginResult> => {
    if (!(await isAdminConfiguredAsync())) {
      return {
        ok: false,
        kind: "not_configured",
        message: "لم يتم إعداد حساب المالك بعد.",
      };
    }
    if (!(await verifyAdminPassword(data.password))) {
      return { ok: false, kind: "invalid_credentials", message: "كلمة المرور غير صحيحة." };
    }
    const session = await createAdminSessionValue();
    if (!session) {
      return { ok: false, kind: "not_configured", message: "تعذر إنشاء جلسة الإدارة." };
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "Set-Cookie": buildAdminSetCookieHeader(session.value),
      },
    }) as unknown as AdminLoginResult;
  });

export const adminLogout = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .handler(() =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "Set-Cookie": buildAdminClearCookieHeader(),
      },
    }) as unknown as { ok: true },
  );
