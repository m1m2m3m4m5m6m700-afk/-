# Flixo Privacy-First Analytics

Flixo uses a first-party analytics layer instead of automatically loading Google Analytics, Microsoft Clarity, or another third-party behavior tracker.

## What is collected

The first-party collector may store a short-lived, random session identifier, locale, canonical tool/category identifiers, path transitions, coarse event type, search-intent identifier, a SHA-256 hash of the normalized search query, result count, and bounded timing information.

## What is intentionally not stored

- IP address
- Raw search query
- Full referrer URL
- Raw user-agent
- Cross-site tracking identifier
- Advertising identifier
- Keystrokes, cursor coordinates, screenshots, or page recordings
- Form contents or uploaded file contents

A session ID is generated with `crypto.randomUUID()` and kept in `sessionStorage`, so it is session-scoped rather than a persistent user identity.

## Behavior intelligence

The admin behavior dashboard aggregates anonymous events into journeys, path transitions, tool funnels, search-intent trends, locale distribution, and event mix. It is intentionally aggregated rather than a replay/recording system.

## Surveys

Survey responses are first-party records tied only to a session-scoped anonymous identifier and locale. Survey questions and response data are managed by the owner, not by a third-party analytics service.

## Failure mode

When Postgres is not configured, the first-party collector returns `not_configured` and never fabricates success. Local browser analytics may continue for owner diagnostics.
