# Flixo Studio

A premium SaaS landing page and AI tools workspace built with TanStack Start, React 19, TypeScript, Tailwind CSS v4, and Radix UI.

## Running the app

The "Start application" workflow runs the Vite development server on port 5000:

```sh
npm run dev
```

Open the Replit preview pane to view the app.

## Stack

- **Framework**: TanStack Start (SSR + Vite)
- **Router**: TanStack Router (file-based)
- **UI**: Radix UI + Tailwind CSS v4
- **Translation**: Gemini API when configured, with a local mock fallback

## Environment variables

| Variable                  | Required | Description                 |
| ------------------------- | -------- | --------------------------- |
| `GEMINI_API_KEY`          | Optional | Enables real AI translation |
| `VITE_GA_MEASUREMENT_ID`  | Optional | Google Analytics            |
| `VITE_CLARITY_PROJECT_ID` | Optional | Microsoft Clarity analytics |

## Project structure

```text
src/
  routes/       # File-based routes and page-level metadata
  components/   # Reusable UI, landing, layout, tool, and admin components
  hooks/        # Custom React hooks
  lib/          # Utilities, services, i18n, theme, and shared logic
  data/         # Static tool and content data
  styles.css    # Global Tailwind styles and theme tokens
```

## Adding a tool

1. Add the tool metadata to the canonical registry in `src/data/tools.ts`.
2. Add or update the corresponding category metadata in `src/data/categories.ts`.
3. Create a route under `src/routes/tools/<tool-name>.tsx`.
4. Build reusable UI in `src/components/tools/`.

## Security notes

- Keep provider keys in Replit Secrets or environment variables; never commit them.
- The development server is configured for Replit's proxied preview and must not be exposed as a public production server.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before shipping changes.

## Engineering handbook

These rules apply to every implementation task. Extend the existing project instead of
rebuilding it, and report any item that could not be verified rather than assuming success.

### Architecture rules

- Preserve the existing TanStack Start architecture, project layout, homepage, brand, and working features.
- Use strict TypeScript, feature-based structure, reusable components, modular files, and data-driven design.
- Treat shared interfaces, registries, and contracts as internal APIs. Preserve backward compatibility and do not break them without a documented reason.
- Do not add a backend, authentication, or external API unless explicitly requested.
- Never delete or overwrite user work.
- If a request conflicts with the current architecture, stop and explain the conflict with viable alternatives before changing code.
- Choose the maintainable solution when a shortcut would increase technical debt.

### Development workflow

Before writing code:

1. Analyze the existing implementation and compare it with the requested behavior.
2. Search the entire project for reusable implementations, utilities, components, hooks, routes, services, styles, and helper functions.
3. Check whether the requested feature already exists or can be integrated into an existing feature. Do not create duplicate functionality.
4. Identify affected files and assess the impact on SEO, performance, other tools, internal contracts, migrations, and user-facing behavior.
5. Reuse existing layouts, hooks, utilities, routes, data sources, SEO helpers, analytics, and design-system components.
6. Add a dependency only when there is a real technical need; document the reason when one is added.

Keep each task focused:

- **One task = one logical change.**
- Fix an unrelated issue only when it blocks the current task.
- Record other discoveries as separate follow-up work instead of expanding the current scope.

### Tool ecosystem rules

Every new tool must integrate with the existing Flixo ecosystem:

- Register in the shared tool registry.
- Belong to an existing or explicitly defined category.
- Expose complete SEO metadata and structured content.
- Define related and discoverable tools where applicable.
- Support search indexing and reuse shared UI, layout, and components.
- Never exist as an isolated page when an existing platform integration point is available.

### Regression protection

New work must not break existing capabilities. Before finishing a task, verify the affected
tools and shared flows, including search, the tool registry, related tools, the assistant,
and SEO behavior. Report any regression risk or unverified area explicitly.

### Tool versioning

Each tool should have an internal semantic version, even when the version is not shown to
users. Record new functionality, fixes, behavioral changes, and breaking changes in the
tool's maintainable metadata or change history when the tool evolves.

### Quality gates

Before finishing every task, run the checks that apply and report their observed output:

- TypeScript typecheck.
- ESLint.
- Production build.
- Import and route verification.
- No new `TODO` or `FIXME` markers.
- No console errors, hydration issues, or broken links.
- Review the complete diff for duplicated logic, unnecessary files, and unintended changes.
- Never claim a check passed unless its output was observed during the current task; mark unavailable checks as unverified.

### Definition of done

A task is complete only when:

- The requested code and user-facing behavior are complete.
- Applicable quality checks passed, or every unverified check is explicitly reported.
- No new errors, duplicated logic, avoidable technical debt, or negative performance impact were introduced.
- SEO, accessibility, responsiveness, branding, and regression risk were reviewed.
- The final report is complete and the Git workflow finished successfully.

### SEO and content

Every new page must provide real, non-thin value with:

- Unique title, meta description, canonical URL, Open Graph, Twitter Card, and brand mention.
- Semantic HTML with one H1 and a logical H2/H3 hierarchy.
- Structured data where applicable, including WebSite, Organization, SoftwareApplication,
  WebApplication, FAQPage, BreadcrumbList, HowTo, BlogPosting, CollectionPage, and ItemList.
- Breadcrumbs, internal links, related tools, use cases, examples, FAQs when applicable,
  last-updated information, and useful tool statistics.
- Search discoverability through the existing sitemap, robots, metadata, hreflang, and indexing conventions.

### Performance

Review the impact on Core Web Vitals, bundle size, and runtime behavior. Prefer:

- Lazy loading, code splitting, dynamic imports, tree shaking, and minimal JavaScript.
- Image optimization, fast first paint, zero layout shift, and avoiding unnecessary re-renders.
- No additional bundle weight or dependency unless the benefit is justified.

### Accessibility and Flixo identity

Every feature must preserve:

- WCAG-oriented keyboard navigation, screen-reader support, ARIA labels, contrast, and focus states.
- Responsive behavior and both RTL and LTR support.
- Flixo's existing design system, colors, components, writing style, and user experience.

### Git workflow

After every completed task:

1. Detect and review all modified files.
2. Stage the intended changes with `git add`.
3. Create a meaningful Conventional Commit.
4. Run `git pull --rebase origin main`.
5. Resolve conflicts safely without overwriting user work.
6. Push to `origin/main`.
7. Verify that the local branch matches `origin/main` and that Git status is clean.

Never force-push unless explicitly requested. If authentication or environment limitations
prevent pushing, report: **Git commit completed. Repository ready for synchronization.
Manual push required.**

### Reporting

End every task with:

- Summary and files modified.
- Architecture, performance, SEO, accessibility, and branding impact.
- TypeScript, Lint, Build, preview, Console, hydration, and link-check status.
- What passed, what failed, and what remains unverified, based only on observed output.
- Git status, commit message and hash, synchronization status, and separate follow-up items.

### Handbook governance

This handbook is considered stable. Add a new rule only when a real development problem
exposes a gap that the existing rules do not cover. Prefer clarifying or updating an
existing rule over adding another overlapping rule.

## User preferences

- Keep port 5000 for development and Replit preview.
- Preserve the existing TanStack Start architecture and project layout.
