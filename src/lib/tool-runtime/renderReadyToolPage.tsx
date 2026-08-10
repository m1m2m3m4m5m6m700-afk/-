import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { getToolBySlug } from "@/data/tools";
import type { ReadyToolRuntimeDefinition } from "./types";

export const createReadyToolHead = (definition: ReadyToolRuntimeDefinition) => () =>
  buildToolHeadMetadata(definition.slug, definition.seoOverride);

function HiddenToolNotice() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground">Tool not available</h1>
        <p className="mt-4 text-muted-foreground">
          This tool is not currently available. It may be under development or has been retired.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

export function renderReadyToolPage(definition: ReadyToolRuntimeDefinition) {
  const ToolPage = () => {
    // Hooks must run on every render, so call useI18n before any early return.
    const { t } = useI18n();

    // Guard: if the tool has been hidden (status no longer "ready"), do not
    // render its implementation. Show a not-found notice instead. This keeps
    // direct URLs from exposing stub/mock tools while preserving their source.
    const tool = getToolBySlug(definition.slug);
    if (tool && tool.status !== "ready") {
      return <HiddenToolNotice />;
    }

    const ToolComponent = definition.component;
    const description = definition.layoutDescriptionKey
      ? t(definition.layoutDescriptionKey as never)
      : definition.layoutDescription;

    return (
      <SiteLayout>
        <ToolLayout
          icon={definition.icon}
          name={resolveToolName(definition.toolId, t)}
          description={description}
          category={resolveCategoryName(definition.categoryId, t)}
          slug={definition.slug}
        >
          <ToolComponent />
        </ToolLayout>
      </SiteLayout>
    );
  };

  ToolPage.displayName = `${definition.toolId.replace(/(^|-)(\w)/g, (_, p1, p2) => p2.toUpperCase())}Page`;

  return ToolPage;
}
