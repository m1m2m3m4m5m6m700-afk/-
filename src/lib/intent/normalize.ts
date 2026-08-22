export const normalizeIntent = (value: string) => value
  .toLocaleLowerCase('en')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const includesTerm = (normalized: string, term: string) => {
  const candidate = normalizeIntent(term);
  return candidate.length > 0 && normalized.includes(candidate);
};
