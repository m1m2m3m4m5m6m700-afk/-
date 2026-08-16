# Main baseline lint failure — 2026-08-16

Run #539 (`31945563359`) failed at `npm run lint` on the merge ref for PR #25.

Exact failure:
- `src/lib/ai/chat/handler.ts:31:69`
- `no-control-regex`
- `Unexpected control character(s) in regular expression: \\x00`

The Phase 1 branch already uses a behavior-preserving null-character sanitization approach based on `String.fromCharCode(0)` instead of a control-character regex. The baseline `main` branch still used `/\\u0000/g`.

This is intentionally tracked separately from PR #25 because #25 is CI topology only.
