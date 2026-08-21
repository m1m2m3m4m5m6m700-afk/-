import type { LocaleCode } from '../config/i18n';

export type WebApplicationSchema = {
  '@context': 'https://schema.org';
  '@type': 'WebApplication';
  name: string;
  url: string;
  inLanguage: LocaleCode;
  applicationCategory: 'MultimediaApplication';
  operatingSystem: 'All';
  browserRequirements: string;
  offers: { '@type': 'Offer'; price: '0'; priceCurrency: 'USD' };
};

export function createToolSchema(input: {
  name: string;
  url: string;
  locale: LocaleCode;
}): WebApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: input.name,
    url: input.url,
    inLanguage: input.locale,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript, HTML5, Canvas, and WebGL when supported by the tool.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}
