import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createBrowserHistory } from "@tanstack/history";
import { getGlobalStartContext } from "@tanstack/react-start";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const requestContext = getGlobalStartContext() as { nonce?: string } | undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ssr: requestContext?.nonce ? { nonce: requestContext.nonce } : undefined,
    history: typeof window !== "undefined" ? createBrowserHistory() : undefined,
  });

  return router;
};
