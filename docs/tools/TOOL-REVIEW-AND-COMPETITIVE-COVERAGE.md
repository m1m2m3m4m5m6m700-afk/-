# Flixo Tool Coverage & Manual Review

## Product rule

Flixo keeps two separate concepts:

- **Readiness**: an implementation exists, has a real runtime, has a public route, and passes the automated truthfulness/runtime gates.
- **Manual review**: the owner has personally exercised the tool and checked its real output.

The **public star button is not a manual QA marker**. It remains available to users so they can contribute feedback through the admin-controlled survey system.

The owner's manual review state uses a separate **verification badge** inside the authenticated admin experience.

## Review semantics

- No verification badge = not manually reviewed.
- Verification badge = manually reviewed by the owner.
- Review state is stored server-side in `tool_reviews` and is protected by the admin session.
- Removing the verification mark returns the tool to the unreviewed state.
- Newly added tools and roadmap capabilities start unreviewed.
- Public user stars must never mutate owner review state.

## Competitive coverage

`src/data/competitiveToolRoadmap.ts` is the master coverage map for capabilities Flixo should eventually compete on. It intentionally contains roadmap targets that are not necessarily implemented.

The public product must continue to obey the real tool registry. Planned, placeholder, and roadmap-only capabilities must not appear in public search or as working tool routes.

## Review workflow

1. Open the Arabic admin area.
2. Open **مراجعة الأدوات**.
3. Filter to **جاهزة** first.
4. Open each tool.
5. Use realistic inputs.
6. Verify the actual output, download, preview, and error behavior.
7. Set the admin verification mark only after the manual check passes.
8. Leave the tool unverified for anything that needs a fix.
9. Keep the public star available for user survey participation.

## Release gate

`npm run validate:tool-review` verifies that review state remains separate from readiness, absent review records are treated as unreviewed, the review mutation is admin-protected, and the admin review UI does not repurpose the public survey star.
