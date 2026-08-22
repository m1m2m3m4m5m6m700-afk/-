import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { TOOLS_REGISTRY } from '../config/tools';
import { LocalizedToolPage, localizedToolHead } from './localized-tool';

export const localizedToolRoutes = SUPPORTED_LANGUAGES.flatMap((language) =>
  TOOLS_REGISTRY.map((tool) => createRoute({
    getParentRoute: () => rootRoute,
    path: `/${language}/${tool.id}`,
    head: () => localizedToolHead({ language, toolId: tool.id }),
    component: () => <LocalizedToolPage language={language} toolId={tool.id} />,
  })),
);

if (localizedToolRoutes.length !== 20 * 22) {
  throw new Error(`Expected 440 localized routes, got ${localizedToolRoutes.length}.`);
}
