import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { useI18n } from "@/lib/i18n";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { getPublicToolRegistration } from "@/lib/tool-platform/publicDesktopTools";
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
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
            {t("toolPage.notFound.backHome")}
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}

export function renderReadyToolPage(definition: ReadyToolRuntimeDefinition) {
  const ToolPage = () => {
    const registration = getPublicToolRegistration(definition.toolId);
    if (!registration || registration.manifest.lifecycle !== "public") return <HiddenToolNotice />;

    const ToolComponent = definition.component;
    return (
      <SiteLayout>
        <ToolLayout
          icon={definition.icon}
          name={registration.manifest.name}
          description={registration.manifest.description}
          category={registration.manifest.category}
          slug={registration.manifest.slug}
        >
          <ToolComponent />
        </ToolLayout>
      </SiteLayout>
    );
  };

  ToolPage.displayName = `${definition.toolId.replace(/(^|-)(\w)/g, (_, p1, p2) => p2.toUpperCase())}Page`;

  return ToolPage;
}
