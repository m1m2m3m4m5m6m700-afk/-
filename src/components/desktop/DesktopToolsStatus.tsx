import { HardDrive, ShieldCheck } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { readyToolRuntimes } from "@/lib/tool-runtime/readyTools";

export function DesktopToolsStatus() {
  const count = readyToolRuntimes.length;

  return (
    <Section
      id="desktop-tools"
      eyebrow="Desktop Tools"
      title={count === 0 ? "Clean desktop-tools baseline" : `${count} verified desktop tools`}
      description={
        count === 0
          ? "Legacy tools are preserved in the repository but isolated from the public surface. New desktop tools are added one at a time after implementation and regression verification."
          : "Only explicitly promoted desktop tools appear here."
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <HardDrive className="size-5" />
            </span>
            <div>
              <h3 className="font-bold">Local-first processing</h3>
              <p className="text-sm text-muted-foreground">Files stay in the browser for desktop tools.</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h3 className="font-bold">Promotion by proof</h3>
              <p className="text-sm text-muted-foreground">A tool becomes public only after its runtime is explicitly promoted.</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
