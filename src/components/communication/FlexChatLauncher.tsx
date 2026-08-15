import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisitorChatWidget } from "@/components/communication/VisitorChatWidget";

export function FlexChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <div className="fixed bottom-5 right-5 z-50">
          <Button
            onClick={() => setOpen(true)}
            className="group size-14 rounded-full border border-primary/20 bg-primary p-0 text-primary-foreground shadow-xl transition hover:bg-primary/90"
            aria-label="Open Flex chat"
          >
            <MessageSquare className="size-6 transition-transform group-hover:scale-105" />
          </Button>
        </div>
      )}
      {open && <VisitorChatWidget initialOpen showTrigger={false} />}
    </>
  );
}
