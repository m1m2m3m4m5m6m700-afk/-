export const normalizeIntent = (value: string) => value
  .toLocaleLowerCase('ar')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const includesTerm = (normalized: string, term: string) => {
  const candidate = normalizeIntent(term);
  return candidate.length > 0 && normalized.includes(candidate);
};
