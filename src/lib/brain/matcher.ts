import type { AISkill } from "./skills";
import type { UserIntent } from "./intent";

export interface SkillMatchResult {
  matched: boolean;
  skill?: AISkill;
  confidence: number;
  reason?: string;
  matchedKeywords: string[];
  alternativeSkills: AISkill[];
}

const STATUS_BOOST = {
  ready: 1.5,
  planned: 1.1,
  placeholder: 1.0,
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[\u200e\u200f\u061c]/g, "")
    .replace(/[^\p{L}\p{N}\s._/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSearchTerm(prompt: string, tokens: string[], term: string): number {
  const cleanTerm = normalize(term);
  if (!cleanTerm || cleanTerm.length < 2) return 0;

  if (prompt === cleanTerm) return 8;
  if (prompt.includes(cleanTerm)) return cleanTerm.includes(" ") ? 5 : 3.5;

  const termTokens = cleanTerm.split(" ").filter((token) => token.length > 1);
  if (termTokens.length <= 1) return 0;

  const matched = termTokens.filter((termToken) => tokens.includes(termToken)).length;
  if (!matched) return 0;
  return (matched / termTokens.length) * 2.5;
}

export function matchSkill(intent: UserIntent, skills: AISkill[]): SkillMatchResult {
  if (!intent.cleanPrompt) {
    return {
      matched: false,
      confidence: 0,
      matchedKeywords: [],
      alternativeSkills: [],
    };
  }

  const locale = intent.languageDetected || "en";
  const scoredSkills = skills.map((skill) => {
    let score = 0;
    const matchedWords = new Set<string>();
    const skillNameClean = normalize(skill.name);
    const skillDescClean = normalize(skill.description);

    const localeTerms = skill.searchTermsByLocale?.[locale] ?? skill.searchTermsByLocale?.en ?? [];
    for (const term of localeTerms) {
      const termScore = scoreSearchTerm(intent.cleanPrompt, intent.tokens, term);
      if (termScore > 0) {
        score += termScore;
        matchedWords.add(term);
      }
    }

    if (intent.cleanPrompt.includes(skillNameClean)) {
      score += 5;
      matchedWords.add(skill.name);
    }

    intent.tokens.forEach((token) => {
      if (skillNameClean.includes(token) && token.length > 2) {
        score += 2;
        matchedWords.add(token);
      }
    });

    skill.tags.forEach((tag) => {
      if (intent.cleanPrompt.includes(normalize(tag))) {
        score += 2.5;
        matchedWords.add(tag);
      }
    });

    skill.examples.forEach((example) => {
      const exClean = normalize(example);
      intent.tokens.forEach((token) => {
        if (exClean.includes(token) && token.length > 3) score += 0.8;
      });
    });

    intent.tokens.forEach((token) => {
      if (skillDescClean.includes(token) && token.length > 3) {
        score += 1.2;
        matchedWords.add(token);
      }
    });

    intent.detectedFileTypes.forEach((ft) => {
      if (skill.tags.includes(ft) || skillDescClean.includes(ft)) {
        score += 3;
        matchedWords.add(ft);
      }
    });

    const finalScore = score * (STATUS_BOOST[skill.status] || 1);

    return {
      skill,
      score: finalScore,
      matchedKeywords: Array.from(matchedWords),
    };
  });

  scoredSkills.sort((a, b) => b.score - a.score);

  const top = scoredSkills[0];
  const alternatives = scoredSkills
    .slice(1, 4)
    .filter((s) => s.score > 1.5)
    .map((s) => s.skill);

  const confidence = top && top.score > 0 ? Math.min(1.0, top.score / 8) : 0;

  if (top && top.score >= 2.0) {
    return {
      matched: true,
      skill: top.skill,
      confidence,
      reason: `Matched based on locale-aware intent signals: ${top.matchedKeywords.join(", ")}`,
      matchedKeywords: top.matchedKeywords,
      alternativeSkills: alternatives,
    };
  }

  return {
    matched: false,
    confidence,
    matchedKeywords: top ? top.matchedKeywords : [],
    alternativeSkills: alternatives,
  };
}
