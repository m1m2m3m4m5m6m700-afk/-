---
name: TanStack SSR hydration
description: Non-obvious constraints for CSP nonces and route-dependent rendering in TanStack Start.
---

TanStack Start’s request-specific CSP nonce must be forwarded into the server router context before the router is created; otherwise SSR inline scripts render without the matching nonce.

**Why:** The application uses a strict CSP and TanStack emits hydration scripts during SSR. A nonce generated only at the outer server handler is not enough unless the request context reaches the router.

**How to apply:** Generate one nonce per request, pass it through the server-entry context and request middleware, and use the rendered CSP meta value as the deterministic client fallback for server-authored JSON-LD. Avoid reading `window.location` during render when the route slug can be passed explicitly; SSR and the first client render must produce the same tree.
