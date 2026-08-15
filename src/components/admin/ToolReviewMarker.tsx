import { useEffect, useState } from "react";
import { BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminToolReview, setAdminToolReviewed } from "@/lib/admin/rpc/tool-review.rpc";

interface ToolReviewMarkerProps {
  slug: string;
}

/**
 * Owner-only QA marker.
 * This intentionally does not use a star: the public star remains reserved for
 * user participation/feedback in the site's admin-controlled surveys.
 */
export function ToolReviewMarker({ slug }: ToolReviewMarkerProps) {
  const [visible, setVisible] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getAdminToolReview({ data: { slug } }).then((result) => {
      if (!active) return;
      if (!result.ok) return;
      setVisible(true);
      setReviewed(result.review.reviewed);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!visible) return null;

  const toggle = async () => {
    if (busy) return;
    const next = !reviewed;
    setBusy(true);
    setReviewed(next);
    const result = await setAdminToolReviewed({ data: { slug, reviewed: next } });
    if (!result.ok) setReviewed(!next);
    setBusy(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={() => void toggle()}
      title={reviewed ? "تمت مراجعة الأداة" : "لم تتم مراجعة الأداة بعد"}
      aria-label={reviewed ? "إلغاء علامة مراجعة الأداة" : "تأكيد مراجعة الأداة"}
      className="shrink-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold"
    >
      <BadgeCheck className={`size-4 ${reviewed ? "text-primary" : "text-muted-foreground"}`} />
      {reviewed && <Check className="size-3.5 text-primary" />}
    </Button>
  );
}
