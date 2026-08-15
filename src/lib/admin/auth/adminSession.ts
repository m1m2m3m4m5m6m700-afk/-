import { createMiddleware } from "@tanstack/react-start";
import { readAdminSession } from "../server/session";
import type { AdminSessionPayload } from "../types";

export const adminSessionMiddleware = createMiddleware().server(async ({ request, next }) => {
  const session = await readAdminSession(request);
  return next({ context: { adminSession: session } });
});

export type AdminMiddlewareContext = { adminSession: AdminSessionPayload | null };
