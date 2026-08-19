# FLIXO Engineering Guardrails

These are repository rules, not suggestions.

## Required before merge

- Dependencies install with `npm ci`.
- Architecture and lifecycle contracts pass.
- Runtime boundaries remain intact.
- TypeScript and ESLint pass.
- Build and route generation pass.
- Publishable tools pass real Chromium verification.
- Output correctness is asserted, not only UI presence.
- Negative and edge cases pass.
- Mutation/fault-injection gates prove that important tests can detect wrong behavior.
- Security and performance gates pass.
- Desktop verification is repeated to detect flakiness.
- Verification evidence is generated for publishable tool results.

## Change discipline

A change that fixes one layer must not weaken another layer to obtain a green build. If a validator reports a false positive, fix the validator so it models the real contract correctly.

## Architecture review triggers

An ADR is required when a change:

- creates a new cross-layer dependency;
- introduces a second registry or lifecycle state;
- adds persistent/external infrastructure;
- changes the verification/publication model;
- changes the contract between tool runtime and UI/routes.

Small implementation changes do not require an ADR.

## Performance policy

Performance budgets should be attached to measurable artifacts such as build output size, route generation, and tool execution/resource usage. Avoid arbitrary thresholds that are not tied to a user-visible risk.

## External services

Sentry, Redis, Service Workers, Testcontainers, and similar infrastructure are optional capabilities. They must not become mandatory dependencies until a real requirement exists and an ADR documents the reason, failure mode, and operational cost.
