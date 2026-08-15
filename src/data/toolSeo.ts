import { getTool, getToolBySlug } from "./tools";
import { categoryById } from "./categories";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoData {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  overview: string;
  features: string[];
  howToUse: string[];
  benefits: string[];
  faqs: ToolFaqItem[];
  examples?: string[];
}

const toolSeoRegistry: Record<string, ToolSeoData> = {
  translator: {
    slug: "translator",
    title: "AI Translator | Flixo Tools",
    description:
      "Translate text seamlessly across 20+ languages with automatic detection, instant bi-directional swap, and txt download. Fast and free.",
    keywords: [
      "ai translator",
      "free translation tool",
      "language translator",
      "auto detect language",
      "online text translation",
      "flixo translator",
    ],
    overview:
      "Flixo AI Translator provides instant, accurate translation for text, phrases, and long documents across over 20 languages. Powered by smart automatic language detection, it allows instant bi-directional language swapping, side-by-side editing, character counting, and one-click file downloads.",
    features: [
      "Smart Auto-Language Detection",
      "Supports 20+ Global Languages (English, Arabic, Spanish, French, German, Chinese, etc.)",
