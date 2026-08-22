import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import { TOOLS_REGISTRY } from '../config/tools';
import { LocalizedToolPage, localizedToolHead } from './localized-tool';

const SPECIAL_COMPRESSOR_PATHS = new Set(['/en/image-compressor', '/ar/image-compressor']);

export const localizedToolRoutes = SUPPORTED_LANGUAGES.flatMap((language) =>
  TOOLS_REGISTRY
    .filter((tool) => !SPECIAL_COMPRESSOR_PATHS.has(`/${language}/${tool.id}`))
    .map((tool) => createRoute({
      getParentRoute: () => rootRoute,
      path: `/${language}/${tool.id}`,
      head: () => localizedToolHead({ language, toolId: tool.id }),
      component: () => <LocalizedToolPage language={language} toolId={tool.id} />,
    })),
);

if (localizedToolRoutes.length !== 20 * 22 - 2) {
  throw new Error(`Expected 438 generic localized routes, got ${localizedToolRoutes.length}.`);
}
