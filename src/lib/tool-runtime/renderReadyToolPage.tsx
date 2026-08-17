import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { getReadyToolRuntime } from "./readyTools";
import type { ReadyToolRuntimeDefinition } from "./types";

export const createReadyToolHead = (definition: ReadyToolRuntimeDefinition) => () =>
  buildToolHeadMetadata(definition.slug, definition.seoOverride);

function HiddenToolNotice() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground">{t("toolPage.notFound.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("toolPage.notFound.description")}</p>
        <Link to="/" className="mt-8 inline-flex rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
          {t("toolPage.notFound.backHome")}
        </Link>
      </div>
    </SiteLayout>
  );
}

/**
 * Shared renderer for explicit tool routes.
 *
 * The route file may remain in the repository for rollback, but a tool is not
 * public unless the exact runtime is promoted in readyTools.ts.
 */
export function renderReadyToolPage(definition: ReadyToolRuntimeDefinition) {
  const ToolPage = () => {
    const { t } = useI18n();
    const publicRuntime = getReadyToolRuntime(definition.slug);

    if (!publicRuntime) return <HiddenToolNotice />;

    const ToolComponent = publicRuntime.component;
    const description = publicRuntime.layoutDescriptionKey
      ? t(publicRuntime.layoutDescriptionKey as never)
      : publicRuntime.layoutDescription;

    return (
      <SiteLayout>
        <ToolLayout
          icon={publicRuntime.icon}
          name={resolveToolName(publicRuntime.toolId, t)}
          description={description}
          category={resolveCategoryName(publicRuntime.categoryId, t)}
          slug={publicRuntime.slug}
        >
          <ToolComponent />
        </ToolLayout>
      </SiteLayout>
    );
  };

  ToolPage.displayName = `${definition.toolId.replace(/(^|-)(\w)/g, (_, _prefix, letter) => letter.toUpperCase())}Page`;

  return ToolPage;
}
