const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/gu;

const normalizeArabicToken = (token: string) => token
  .replace(/^لل(?=[\p{L}])/u, '')
  .replace(/^و(?=[\p{L}])/u, '')
  .replace(/^(?:ف|ب|ك|ل)(?=[\p{L}])/u, '')
  .replace(/^ال(?=[\p{L}])/u, '');

export const normalizeIntent = (value: string) => value
  .toLocaleLowerCase('ar')
  .normalize('NFKD')
  .replace(ARABIC_DIACRITICS, '')
  .replace(/[إأآٱ]/gu, 'ا')
  .replace(/ى/gu, 'ي')
  .replace(/ؤ/gu, 'و')
  .replace(/ئ/gu, 'ي')
  .replace(/ة/gu, 'ه')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizedTokens = (value: string) => normalizeIntent(value)
  .split(' ')
  .filter(Boolean)
  .map(normalizeArabicToken);

const variantPhrases = (term: string) => {
  const raw = normalizeIntent(term);
  const tokens = raw.split(' ').filter(Boolean);
  if (!tokens.length) return [];

  const variants = new Set<string>([raw]);
  const stripped = tokens.map(normalizeArabicToken).join(' ');
  if (stripped && stripped !== raw) variants.add(stripped);
  return [...variants];
};

export const includesTerm = (normalized: string, term: string) => {
  const candidate = normalizeIntent(term);
  if (!candidate) return false;
  if (normalized.includes(candidate)) return true;

  const source = normalizedTokens(normalized).join(' ');
  return variantPhrases(candidate).some((variant) => {
    const variantTokens = normalizedTokens(variant).join(' ');
    return Boolean(variantTokens) && source.includes(variantTokens);
  });
};
