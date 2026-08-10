import { CircleCheck as CheckCircle2, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { trackToolRequest } from "@/lib/analytics";

interface RequestToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDescription?: string;
}

export function RequestToolDialog({
  open,
  onOpenChange,
  initialDescription,
}: RequestToolDialogProps) {
  const { t } = useI18n();
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription(initialDescription ?? "");
      setSubmitted(false);
    }
  }, [open, initialDescription]);

  const handleSubmit = () => {
    trackToolRequest(description);
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("request.success")}
            </p>
            <Button className="mt-6 rounded-xl" onClick={() => onOpenChange(false)}>
              {t("request.ok")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
                  <Lightbulb className="size-4" />
                </span>
                <DialogTitle>{t("request.title")}</DialogTitle>
              </div>
              <DialogDescription>{t("request.description")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="request-description" className="text-sm font-medium">
                {t("request.label")}
              </label>
              <Textarea
                id="request-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("request.placeholder")}
                rows={4}
                className="resize-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>
                {t("request.cancel")}
              </Button>
              <Button className="rounded-xl" onClick={handleSubmit} disabled={!description.trim()}>
                {t("request.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
