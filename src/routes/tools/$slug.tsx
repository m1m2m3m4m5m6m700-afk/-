import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { getReadyToolRuntime } from "@/lib/tool-runtime/readyTools";
import { getPublicToolRegistration } from "@/lib/tool-platform";
import { trackPageView } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { resolveCategoryName, resolveToolName } from "@/lib/i18n/keys";
import { buildToolHeadMetadata } from "@/lib/seo/toolPageMetadata";
import { usePageSeo } from "@/lib/usePageSeo";

export const Route = createFileRoute("/tools/$slug")({
  head: ({ params }) => {
    const registration = getPublicToolRegistrationBySlug(params.slug);
    return buildToolHeadMetadata(params.slug, registration ? getReadyToolRuntime(params.slug)?.seoOverride : undefined);
  },
  component: ToolSlugRoute,
});

function getPublicToolRegistrationBySlug(slug: string) {
  return getPublicToolRegistrationForSlug(slug);
}

function getPublicToolRegistrationForSlug(slug: string) {
  const registration = getPublicToolRegistration(slug);
  if (registration?.manifest.slug === slug) return registration;
  return undefined;
}

function ToolSlugRoute() {
  const { t } = useI18n();
  const { slug } = Route.useParams();
  const runtime = getReadyToolRuntime(slug);
  const registration = getPublicToolRegistrationForSlug(slug);

  usePageSeo(slug, runtime?.seoOverride, "en");

  useEffect(() => {
    trackPageView(`/tools/${slug}`);
  }, [slug]);

  if (!runtime || !registration) throw notFound();

  const ToolComponent = runtime.component;
  const description = runtime.layoutDescriptionKey
    ? t(runtime.layoutDescriptionKey as never)
    : runtime.layoutDescription;

  return (
    <SiteLayout>
      <ToolLayout
        icon={runtime.icon}
        name={resolveToolName(registration.manifest.id, t)}
        description={description}
        category={resolveCategoryName(registration.manifest.category, t)}
        slug={registration.manifest.slug}
      >
        <ToolComponent />
      </ToolLayout>
    </SiteLayout>
  );
}
