import { useState, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { AnalyticsDialog } from "@/components/landing/AnalyticsDialog";
import { VisitorChatWidget } from "@/components/communication/VisitorChatWidget";
import { FlixoChatWidget } from "@/components/chat/FlixoChatWidget";

interface SiteLayoutProps {
  children: ReactNode;
  onRequestTool?: () => void;
}

/** Shared page chrome. Every public page and tool page renders inside this. */
export function SiteLayout({ children, onRequestTool }: SiteLayoutProps) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer onRequestTool={onRequestTool} onOpenAnalytics={() => setAnalyticsOpen(true)} />
      <AnalyticsDialog open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
      <VisitorChatWidget />
      {/* Free chatbot powered by Gemini Free Tier (server-side, no key in client). */}
      <FlixoChatWidget />
    </div>
  );
}
