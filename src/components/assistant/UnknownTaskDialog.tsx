import { useState } from "react";
import { HelpCircle, Sparkles, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnknownRequestsService } from "@/lib/brain";

interface UnknownTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  onRequestSubmitted?: (prompt: string) => void;
}

export function UnknownTaskDialog({
  open,
  onOpenChange,
  prompt,
  onRequestSubmitted,
}: UnknownTaskDialogProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleConfirmRequest = () => {
    UnknownRequestsService.saveRequest(prompt, email);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
      onRequestSubmitted?.(prompt);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-lift backdrop-blur-2xl">
        <DialogHeader className="space-y-3 text-start">
          <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
            <HelpCircle className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            I don't know this task yet.
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            I can learn it and recommend adding it to Flixo's roadmap for high-priority build.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-3 rounded-2xl border border-border/60 bg-surface/50 p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Requested Task
          </div>
          <div className="font-mono text-xs text-foreground bg-card p-2.5 rounded-xl border border-border/50 break-words">
            "{prompt}"
          </div>
          <div className="pt-1">
            <label className="text-xs text-muted-foreground block mb-1 font-medium">
              Notify email (optional)
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs rounded-xl h-9 bg-card"
            />
          </div>
        </div>

        {submitted ? (
          <div className="py-2 text-center text-xs font-bold text-emerald-500 flex items-center justify-center gap-1.5">
            <Sparkles className="size-4 animate-spin" />
            Task request logged! We'll prioritize building it.
          </div>
        ) : (
          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmRequest}
              className="rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="me-1.5 size-3.5" />
              Request Tool
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
