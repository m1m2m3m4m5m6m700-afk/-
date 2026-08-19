# CI Stability Policy

A change is considered stable only after the Tool Platform workflow completes successfully on the same code state twice in succession.

## Required gates

1. Strict Project Foundation passes.
2. Performance budget passes.
3. Tool contract, lifecycle, and boundary validators pass.
4. Property/fuzz, fault-injection, security, and mutation checks pass.
5. Real desktop verification passes with repeatability enabled.
6. Verification evidence exists for every verified desktop tool and expected/actual fingerprints match.
7. No failed, cancelled, skipped, focused, or flaky verification is accepted as a green state.

A new tool may not be promoted to `verified` or `public` until the full gate passes. A code change invalidates the previous consecutive-green count.
