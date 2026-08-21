import { createRootRoute } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: RootShell,
});

function RootShell() {
  return (
    <main className="foundation" aria-labelledby="foundation-title">
      <p className="eyebrow">FLIXO FOUNDATION</p>
      <h1 id="foundation-title">Clean starting point.</h1>
      <p className="status">0 tools registered · 0 product assumptions</p>
    </main>
  );
}
