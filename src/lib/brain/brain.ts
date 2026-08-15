import { getAllSkills, type AISkill } from "./skills";
import { extractIntent, type UserIntent } from "./intent";
import { matchSkill, type SkillMatchResult } from "./matcher";
import { trackKeywordSearch, trackToolOpen, trackCategoryVisit } from "@/lib/analytics";
import type { LocaleCode } from "@/lib/i18n";
import { submitFlexToolRequest } from "@/lib/requests/submitToolRequest";

export type BrainStatus = "idle" | "thinking" | "analyzing" | "matching" | "ready" | "unknown";

export interface BrainProcessOptions {
  attachment?: {
    file?: File;
    name?: string;
    type?: string;
  };
  linkUrl?: string;
  locale?: LocaleCode;
  onStatusChange?: (status: BrainStatus, text: string) => void;
}

export interface BrainProcessResult {
  matched: boolean;
  skill?: AISkill;
  intent: UserIntent;
  confidence: number;
  matchedKeywords: string[];
  alternativeSkills: AISkill[];
  status: BrainStatus;
  statusText: string;
  route?: string;
}

export class UnknownRequestsService {
  private static STORAGE_KEY = "flixo_unknown_requests";

  public static getRequests(): Array<{ id: string; prompt: string; count: number; date: string }> {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static saveRequest(prompt: string, attachmentInfo?: string): void {
    if (typeof window === "undefined" || !prompt.trim()) return;
    try {
      const requests = this.getRequests();
      const clean = prompt.trim();
      const existing = requests.find((r) => r.prompt.toLowerCase() === clean.toLowerCase());

      if (existing) {
        existing.count += 1;
        existing.date = new Date().toISOString();
      } else {
        requests.unshift({
          id: `req-${Date.now()}`,
          prompt: clean,
          count: 1,
          date: new Date().toISOString(),
        });
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests.slice(0, 100)));
    } catch {
      // local fallback only; database write happens separately in the server function.
    }
  }
}

export class FlixoBrain {
  public async processRequest(
    prompt: string,
    options?: BrainProcessOptions,
  ): Promise<BrainProcessResult> {
    const notify = (status: BrainStatus, text: string) => {
      options?.onStatusChange?.(status, text);
    };

    notify("thinking", "Thinking...");
    await new Promise((resolve) => setTimeout(resolve, 180));

    notify("analyzing", "Analyzing task intent...");
    const intent = extractIntent(prompt, {
      hasAttachment: Boolean(options?.attachment),
      attachmentType: options?.attachment?.type,
      url: options?.linkUrl,
      locale: options?.locale,
    });
    await new Promise((resolve) => setTimeout(resolve, 220));

    notify("matching", "Finding the best tool...");
    const skills = getAllSkills();
    const match: SkillMatchResult = matchSkill(intent, skills);
    await new Promise((resolve) => setTimeout(resolve, 200));

    trackKeywordSearch(prompt);

    if (match.matched && match.skill) {
      notify("ready", "Ready");
      trackCategoryVisit(match.skill.categoryId);
      if (match.skill.status === "ready") trackToolOpen(match.skill.name);

      return {
        matched: true,
        skill: match.skill,
        intent,
        confidence: match.confidence,
        matchedKeywords: match.matchedKeywords,
        alternativeSkills: match.alternativeSkills,
        status: "ready",
        statusText: "Ready",
        route: match.skill.route,
      };
    }

    notify("unknown", "No matching tool found");

    // Keep the legacy browser cache for resilience, but make the admin database
    // the authoritative backlog whenever the database is configured.
    UnknownRequestsService.saveRequest(prompt, options?.attachment?.name);
    void submitFlexToolRequest({
      data: {
        prompt,
        locale: options?.locale,
        attachmentName: options?.attachment?.name,
        linkUrl: options?.linkUrl,
        confidence: match.confidence,
        intentId: intent.actionKeywords.join(",") || undefined,
      },
    }).catch(() => undefined);

    return {
      matched: false,
      intent,
      confidence: match.confidence,
      matchedKeywords: match.matchedKeywords,
      alternativeSkills: match.alternativeSkills,
      status: "unknown",
      statusText: "I don't know this task yet",
    };
  }
}

export const brain = new FlixoBrain();
