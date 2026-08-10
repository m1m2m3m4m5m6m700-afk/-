export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  logoAlt?: string;
  tagline?: string;
  description: string;
  websiteUrl: string;
  badgeText?: string;
  tier?: "hero" | "category" | "community";
  active: boolean;
}

/**
 * Global active sponsors list.
 * Update this array to display active sponsors across the Flixo website.
 * When empty, the SponsorSection displays the "Your Company Could Be Here" invitation card.
 */
export const INITIAL_SPONSORS: Sponsor[] = [
  // Example active sponsor structure (uncomment when onboarding real sponsors):
  /*
  {
    id: "tech-flow-ai",
    name: "TechFlow AI",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    logoAlt: "TechFlow AI Logo",
    tagline: "Ultra-fast LLM Infrastructure",
    description: "Accelerate your AI workflows with low-latency private API endpoints.",
    websiteUrl: "https://example.com",
    badgeText: "Featured Sponsor",
    tier: "hero",
    active: true,
  },
  */
];
