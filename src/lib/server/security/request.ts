/**
 * Request helpers — SERVER-ONLY.
 *
 * Extracts client IP and device/country hints from a Request for analytics +
 * rate-limiting. `x-forwarded-for` is honored (Vercel sets it); the first
 * public hop is used. Country is read from `x-vercel-ip-country` (set by
 * Vercel) — null elsewhere (no fabrication).
 */

export function getClientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  return real || null;
}

export function getCountry(request: Request): string | null {
  const c = request.headers.get("x-vercel-ip-country");
  return c && c.trim() ? c.trim() : null;
}

export function getDevice(request: Request): string | null {
  const ua = request.headers.get("user-agent");
  if (!ua) return null;
  if (/mobile|android|iphone|ipad/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

export function getReferrer(request: Request): string | null {
  const ref = request.headers.get("referer");
  if (!ref) return null;
  try {
    const url = new URL(ref);
    return url.host || null;
  } catch {
    return null;
  }
}
