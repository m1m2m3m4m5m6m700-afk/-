import type { Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  readonly intentSearchName = 'Describe your goal';
  readonly arabicIntentSearchName = 'اكتب ما تريد إنجازه';

  async open(locale: 'en' | 'ar' = 'en') {
    await this.page.goto(locale === 'ar' ? '/ar' : '/');
  }

  intentSearch(locale: 'en' | 'ar' = 'en') {
    return this.page.getByRole('textbox', { name: locale === 'ar' ? this.arabicIntentSearchName : this.intentSearchName });
  }

  recommendation() {
    return this.page.locator('.home-intent-result');
  }

  workflowLink(name: RegExp | string) {
    return this.recommendation().getByRole('link', { name });
  }
}
