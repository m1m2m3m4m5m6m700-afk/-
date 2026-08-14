import { tools, toolRoute, type Tool, type ToolStatus } from "@/data/tools";
import { categoryById, type CategoryId } from "@/data/categories";
import { LOCALES } from "@/lib/i18n";
import { getToolSearchTerms } from "./search-intents";

export interface AISkill {
  id: string;
  name: string;
  description: string;
  categoryId: CategoryId;
  categoryName: string;
  status: ToolStatus;
  tags: string[];
  slug?: string;
  route?: string;
  examples: string[];
  actionLabel: string;
  /** Locale-aware natural-language discovery terms mapped to this canonical skill. */
  searchTermsByLocale?: Record<string, string[]>;
}

const CUSTOM_EXAMPLES: Record<string, string[]> = {
  translator: [
    "Translate 'Welcome to our platform' into French and Spanish",
    "Translate this text to German automatically",
    "How do you say thank you in Japanese?",
  ],
  "image-enhancer": [
    "Enhance this photo and remove noise",
    "Upscale photo resolution 4x without losing sharpness",
    "Restore old facial portrait clarity",
  ],
  "background-remover": [
    "Remove background from product photo",
    "Cut out background and save transparent PNG",
    "Isolate person from photo background",
  ],
  "image-compressor": [
    "Compress image file size under 500KB",
    "Shrink PNG image without losing quality",
    "Optimize website images for faster loading",
  ],
  "qr-generator": [
    "Generate QR code for my website link",
    "Create Wi-Fi network QR code",
    "Make custom color QR code for contact card",
  ],
  "password-generator": [
    "Generate 16-character strong password with symbols",
    "Create secure random password for admin account",
    "Make memorable passphrase with numbers",
  ],
  "pdf-merge": [
    "Merge 3 PDF files into one single document",
    "Combine cover letter and resume PDFs",
  ],
  "pdf-compress": ["Reduce PDF document file size for email attachment", "Compress scanned PDF"],
  summarizer: ["Summarize long article into bullet points", "Provide TL;DR of meeting notes"],
  "video-compressor": ["Compress MP4 video clip for Discord attachment", "Shrink 4K video file"],
  "audio-transcriber": ["Transcribe audio recording to English text", "Convert speech MP3 to text"],
};

function toolToSkill(tool: Tool): AISkill {
  const category = categoryById.get(tool.categoryId);
  const route = toolRoute(tool);
  const examples = CUSTOM_EXAMPLES[tool.id] || [
    `Use ${tool.name} to ${tool.description.toLowerCase()}`,
    `${tool.name} for ${tool.categoryId} tasks`,
  ];

  const searchTermsByLocale = Object.fromEntries(
    LOCALES.map((locale) => [locale.code, getToolSearchTerms(tool, locale.code).terms]),
  );

  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    categoryId: tool.categoryId,
    categoryName: category?.name || tool.categoryId,
    status: tool.status,
    tags: tool.tags || [],
    slug: tool.slug,
    route,
    examples,
    actionLabel: tool.status === "ready" ? `Open ${tool.name}` : `Request ${tool.name}`,
    searchTermsByLocale,
  };
}

const initialSkills: AISkill[] = tools.map(toolToSkill);

class SkillsRegistry {
  private skillsMap = new Map<string, AISkill>();

  constructor() {
    initialSkills.forEach((skill) => this.skillsMap.set(skill.id, skill));
  }

  public registerSkill(skill: AISkill): void {
    this.skillsMap.set(skill.id, skill);
  }

  public getAllSkills(): AISkill[] {
    return Array.from(this.skillsMap.values());
  }

  public getSkillById(id: string): AISkill | undefined {
    return this.skillsMap.get(id);
  }

  public getSkillsByCategory(categoryId: CategoryId): AISkill[] {
    return this.getAllSkills().filter((s) => s.categoryId === categoryId);
  }

  public getReadySkills(): AISkill[] {
    return this.getAllSkills().filter((s) => s.status === "ready");
  }
}

export const skillsRegistry = new SkillsRegistry();

export const getAllSkills = () => skillsRegistry.getAllSkills();
export const getSkillById = (id: string) => skillsRegistry.getSkillById(id);
export const getSkillsByCategory = (catId: CategoryId) => skillsRegistry.getSkillsByCategory(catId);
export const getReadySkills = () => skillsRegistry.getReadySkills();
export const registerSkill = (skill: AISkill) => skillsRegistry.registerSkill(skill);
