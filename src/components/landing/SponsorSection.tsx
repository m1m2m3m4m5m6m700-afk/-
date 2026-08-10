import { motion } from "motion/react";
import {
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Heart,
  Ban,
  Rocket,
  Mail,
  Check,
  Copy,
  Info,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { INITIAL_SPONSORS, type Sponsor } from "@/data/sponsors";
import { cn } from "@/lib/utils";

interface SponsorSectionProps {
  sponsors?: Sponsor[];
  variant?: "default" | "compact";
  className?: string;
}

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    text: "Limited Ads",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  { icon: Ban, text: "No Popups", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { icon: Zap, text: "Fast Website", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  {
    icon: Lock,
    text: "Privacy Friendly",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Heart,
    text: "Free Forever",
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  },
];

export function SponsorSection({
  sponsors = INITIAL_SPONSORS,
  variant = "default",
  className,
}: SponsorSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeSponsors = sponsors.filter((s) => s.active);
  const hasSponsors = activeSponsors.length > 0;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("sponsors@flixotools.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompact = variant === "compact";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/5 via-card/70 to-surface/90 p-6 sm:p-8 md:p-10 shadow-lg backdrop-blur-xl dark:from-primary/10 dark:via-card/40 dark:to-background/80 transition-all",
        isCompact && "p-5 sm:p-6",
        className,
      )}
    >
      {/* Decorative background glow circle */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 space-y-8">
        {/* Header Block */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs">
            <span className="text-base leading-none">📢</span>
            Sponsor Area
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
            Supporting Privacy-First, Free Tools
          </h2>

          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              We don&apos;t use intrusive or annoying advertisements because the user experience
              always comes first.
            </p>
            <p>
              Flixo relies on a limited number of carefully selected sponsors to keep all tools free
              while continuously improving the platform and releasing new tools.
            </p>
            <p className="font-medium text-foreground/90">
              Thank you to our sponsors for supporting Flixo and to our users for their trust.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_BADGES.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-transform hover:scale-105",
                    badge.color,
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sponsor Cards Section */}
        <div className="pt-2">
          {hasSponsors ? (
            /* Active Sponsors Grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSponsors.map((sponsor) => (
                <Card
                  key={sponsor.id}
                  className="group relative overflow-hidden rounded-2xl border-border/80 bg-card/80 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
                >
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {sponsor.logoUrl ? (
                          <img
                            src={sponsor.logoUrl}
                            alt={sponsor.logoAlt || sponsor.name}
                            className="size-10 rounded-xl object-contain bg-surface p-1 border border-border/50"
                          />
                        ) : (
                          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                            {sponsor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                            {sponsor.name}
                          </h3>
                          {sponsor.tagline && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {sponsor.tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold"
                      >
                        {sponsor.badgeText || "Sponsored"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {sponsor.description}
                    </p>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    >
                      <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer">
                        Visit Website
                        <ExternalLink className="ms-1.5 size-3.5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State: Your Company Could Be Here */
            <Card className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-card/60 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-card/90 hover:shadow-xl text-center">
              <CardContent className="p-0 max-w-xl mx-auto space-y-4">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Rocket className="size-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
                    🚀 Your Company Could Be Here
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Become one of the first official Flixo sponsors and help keep the platform free
                    for everyone.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="rounded-xl shadow-md text-xs sm:text-sm font-bold px-6 py-2.5"
                  >
                    <Sparkles className="me-2 size-4" />
                    Become a Sponsor
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                    className="rounded-xl text-xs sm:text-sm font-semibold px-5 py-2.5"
                  >
                    <Info className="me-2 size-4" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sponsorship Information & Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 sm:p-8">
          <DialogHeader className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
              <Sparkles className="size-3.5" />
              Flixo Sponsorship Program
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Become an Official Flixo Sponsor
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Reach thousands of developers, designers, and digital power users daily with native,
              privacy-friendly brand placement across all tool hubs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            {/* Why Sponsor Section */}
            <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Why Partner With Flixo?
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>High-Intent Audience:</strong> 100% active users performing technical,
                    creative & productive tasks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>Zero Ad-Blocker Friction:</strong> 100% native UI integration without
                    third-party ad network scripts.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>Privacy & Trust:</strong> 0 invasive tracking cookies, aligning your
                    brand with clean privacy standards.
                  </span>
                </li>
              </ul>
            </div>

            {/* Sponsorship Tiers Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sponsorship Opportunities
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-card p-3 text-center space-y-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-primary/30 text-primary"
                  >
                    Hero Partner
                  </Badge>
                  <p className="text-xs font-bold">Homepage Top</p>
                  <p className="text-[10px] text-muted-foreground">Maximum site visibility</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-3 text-center space-y-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-emerald-500/30 text-emerald-500"
                  >
                    Category Hub
                  </Badge>
                  <p className="text-xs font-bold">Tool Categories</p>
                  <p className="text-[10px] text-muted-foreground">Target specific users</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-3 text-center space-y-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-indigo-500/30 text-indigo-500"
                  >
                    Tool Supporter
                  </Badge>
                  <p className="text-xs font-bold">Tool Page Footer</p>
                  <p className="text-[10px] text-muted-foreground">High recurring clicks</p>
                </div>
              </div>
            </div>

            {/* Contact Email Action */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Get in touch with our team:
                </span>
                <span className="text-xs font-mono text-primary font-medium">
                  sponsors@flixotools.com
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  className="rounded-xl text-xs h-9"
                >
                  {copied ? (
                    <Check className="me-1.5 size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="me-1.5 size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy Email"}
                </Button>

                <Button asChild size="sm" className="rounded-xl text-xs font-semibold h-9">
                  <a href="mailto:sponsors@flixotools.com?subject=Flixo%20Sponsorship%20Inquiry">
                    <Mail className="me-1.5 size-3.5" />
                    Send Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
