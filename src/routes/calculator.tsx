import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { CalculatorTool } from '../tools/calculator';

export const calculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculator',
  head: () => ({
    meta: [
      { title: 'Scientific Calculator | FLIXO' },
      { name: 'description', content: 'Scientific calculator with arithmetic, trigonometry, roots, logarithms, memory, history, and DEG/RAD modes.' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: CalculatorTool,
});
