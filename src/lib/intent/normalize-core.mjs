const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/gu;

const normalizeArabicToken = (token) => token
  .replace(/^لل(?=[\p{L}])/u, '')
  .replace(/^و(?=[\p{L}]{2,})/u, '')
  .replace(/^(?:ف|ب|ك|ل)(?=[\p{L}]{2,})/u, '')
  .replace(/^ال(?=[\p{L}]{2,})/u, '');

export const normalizeIntent = (value) => value
  .toLocaleLowerCase('ar')
  .normalize('NFKD')
  .replace(ARABIC_DIACRITICS, '')
  .replace(/[إأآٱ]/gu, 'ا')
  .replace(/ى/gu, 'ي')
  .replace(/ؤ/gu, 'و')
  .replace(/ئ/gu, 'ي')
  .replace(/ة/gu, 'ه')
  .replace(/ـ/gu, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizedTokens = (value) => normalizeIntent(value)
  .split(' ')
  .filter(Boolean)
  .map(normalizeArabicToken);

const phraseMatches = (sourceTokens, termTokens) => {
  if (!termTokens.length || termTokens.length > sourceTokens.length) return false;
  for (let index = 0; index <= sourceTokens.length - termTokens.length; index += 1) {
    if (termTokens.every((token, offset) => sourceTokens[index + offset] === token)) return true;
  }
  return false;
};

const variantPhrases = (term) => {
  const rawTokens = normalizeIntent(term).split(' ').filter(Boolean);
  if (!rawTokens.length) return [];
  const variants = new Set();
  const raw = rawTokens.join(' ');
  variants.add(raw);
  variants.add(rawTokens.map(normalizeArabicToken).join(' '));
  return [...variants].filter(Boolean);
};

export const includesTerm = (normalized, term) => {
  const sourceTokens = normalizedTokens(normalized);
  if (!sourceTokens.length) return false;
  return variantPhrases(term).some((variant) => phraseMatches(sourceTokens, normalizedTokens(variant)));
};
