import type { AISkill } from "./skills";
import type { UserIntent } from "./intent";
import { categories, categoryById } from "@/data/categories";

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

export function matchSkill(intent: UserIntent, skills: AISkill[]): SkillMatchResult {
  if (!intent.cleanPrompt) {
    return {
      matched: false,
      confidence: 0,
      matchedKeywords: [],
      alternativeSkills: [],
    };
  }

  const scoredSkills = skills.map((skill) => {
    let score = 0;
    const matchedWords = new Set<string>();

    const skillNameClean = skill.name.toLowerCase();
    const skillDescClean = skill.description.toLowerCase();

    // 1. Direct Skill Name Match
    if (intent.cleanPrompt.includes(skillNameClean)) {
      score += 5;
      matchedWords.add(skill.name);
    }

    // Token matches against skill name
    intent.tokens.forEach((token) => {
      if (skillNameClean.includes(token) && token.length > 2) {
        score += 2;
        matchedWords.add(token);
      }
    });

    // 2. Tag Matches
    skill.tags.forEach((tag) => {
      if (intent.cleanPrompt.includes(tag.toLowerCase())) {
        score += 2.5;
        matchedWords.add(tag);
      }
    });

    // 3. Examples Matches
    skill.examples.forEach((example) => {
      const exClean = example.toLowerCase();
      intent.tokens.forEach((token) => {
        if (exClean.includes(token) && token.length > 3) {
          score += 0.8;
        }
      });
    });

    // 4. Description Matches
    intent.tokens.forEach((token) => {
      if (skillDescClean.includes(token) && token.length > 3) {
        score += 1.2;
        matchedWords.add(token);
      }
    });

    // 5. File Type alignment
    intent.detectedFileTypes.forEach((ft) => {
      if (skill.tags.includes(ft) || skillDescClean.includes(ft)) {
        score += 3;
        matchedWords.add(ft);
      }
    });

    // Apply Status Weighting (prefer ready live tools)
    const finalScore = score * (STATUS_BOOST[skill.status] || 1);

    return {
      skill,
      score: finalScore,
      matchedKeywords: Array.from(matchedWords),
    };
  });

  // Sort by score descending
  scoredSkills.sort((a, b) => b.score - a.score);

  const top = scoredSkills[0];
  const alternatives = scoredSkills
    .slice(1, 4)
    .filter((s) => s.score > 1.5)
    .map((s) => s.skill);

  // Confidence calculation normalized 0.0 - 1.0
  const confidence = top && top.score > 0 ? Math.min(1.0, top.score / 6.5) : 0;

  if (top && top.score >= 2.0) {
    return {
      matched: true,
      skill: top.skill,
      confidence,
      reason: `Matched based on intent signals: ${top.matchedKeywords.join(", ")}`,
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
