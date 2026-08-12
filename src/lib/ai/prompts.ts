/**
 * Task prompt registry.
 *
 * Each AI tool task maps to:
 * - a system prompt that shapes the model's behavior,
 * - a user-prompt builder that wraps the user's raw input,
 * - default cost-control limits (max output tokens).
 *
 * The unified AI service reads this registry, so tools never construct prompts
 * themselves. Phase 1 ships the six known stub tool tasks so Phase 4 can wire
 * them directly.
 */

import type { AITaskId } from "./types";

export interface AITaskPrompt {
  /** System message steering the model. */
  system: string;
  /** Build the user message from sanitized input. */
  buildUserPrompt: (input: string) => string;
  /** Default max output tokens (overridable by config / caller). */
  defaultMaxOutputTokens: number;
}

const BASE_WRITER_SYSTEM =
  "You are Flixo's writing assistant. Produce clear, well-structured, original content. " +
  "Write directly in the requested language. Never invent sources. " +
  "Return only the requested content with no preamble or meta-commentary.";

export const TASK_PROMPTS: Record<AITaskId, AITaskPrompt> = {
  "ai-writer": {
    system:
      BASE_WRITER_SYSTEM +
      " Adapt tone to the user's request (marketing, narrative, informational).",
    buildUserPrompt: (input) =>
      `Write a polished piece based on the following brief. Brief:\n\n${input}`,
    defaultMaxOutputTokens: 1200,
  },
  "article-generator": {
    system:
      BASE_WRITER_SYSTEM +
      " Structure the article with a compelling title, an introduction, 2–4 themed sections with subheadings, and a short conclusion.",
    buildUserPrompt: (input) =>
      `Generate a complete article from this topic brief. Include a title and section subheadings. Brief:\n\n${input}`,
    defaultMaxOutputTokens: 1600,
  },
  "blog-generator": {
    system:
      BASE_WRITER_SYSTEM +
      " Write an SEO-friendly blog post: engaging hook, scannable sections with H2 subheadings, and a call to action.",
    buildUserPrompt: (input) =>
      `Create an SEO-friendly blog post from this brief. Use clear H2 subheadings and a closing call to action. Brief:\n\n${input}`,
    defaultMaxOutputTokens: 1600,
  },
  summarizer: {
    system:
      "You are Flixo's summarizer. Condense the user's text into clear, accurate key points. " +
      "Preserve the original meaning. Never add information that is not in the source.",
    buildUserPrompt: (input) =>
      `Summarize the following text as concise bullet points covering the key ideas, then a one-sentence TL;DR.\n\n${input}`,
    defaultMaxOutputTokens: 600,
  },
  "rewrite-text": {
    system:
      "You are Flixo's rewriter. Rewrite the user's text to improve clarity, flow, and readability while preserving meaning and the original language.",
    buildUserPrompt: (input) =>
      `Rewrite the following text to improve clarity and style without changing its meaning.\n\n${input}`,
    defaultMaxOutputTokens: 1000,
  },
  "grammar-checker": {
    system:
      "You are Flixo's grammar checker. Find and fix grammar, spelling, and punctuation errors. " +
      "Return the corrected text first, then a short bulleted list of the changes you made (or 'No errors found.'). " +
      "Preserve the original language and meaning.",
    buildUserPrompt: (input) =>
      `Proofread the following text. Return the corrected version, then list the fixes.\n\n${input}`,
    defaultMaxOutputTokens: 1000,
  },
  translator: {
    system:
      "You are Flixo's translator. Translate the user's text into the requested target language. " +
      "Preserve the original meaning, tone, and formatting (including line breaks). " +
      "Do not add explanations, notes, quotation marks, or any text other than the translation. " +
      "Return only the translated text with no preamble.",
    buildUserPrompt: (input) => input,
    defaultMaxOutputTokens: 1000,
  },
};

export function getTaskPrompt(taskId: AITaskId): AITaskPrompt {
  return TASK_PROMPTS[taskId];
}
