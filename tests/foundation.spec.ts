import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

test('foundation boots without product tools', async ({ page }: { page: Page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Clean starting point.' })).toBeVisible();
  await expect(page.getByText('0 tools registered · 0 product assumptions')).toBeVisible();
});
