import { lazy, Suspense, useState, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

const AnalyticsDialog = lazy(() => import("@/components/landing/AnalyticsDialog").then((module) => ({ default: module.AnalyticsDialog })));
const FlexChatWidget = lazy(() => import("@/components/communication/VisitorChatWidget").then((module) => ({ default: module.VisitorChatWidget })));

interface SiteLayoutProps {
  children: ReactNode;
  onRequestTool?: () => void;
  showFloatingChat?: boolean;
}

export function SiteLayout({ children, onRequestTool, showFloatingChat = true }: SiteLayoutProps) {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer onRequestTool={onRequestTool} onOpenAnalytics={() => setAnalyticsOpen(true)} />
      <Suspense fallback={null}>
        {analyticsOpen && <AnalyticsDialog open={analyticsOpen} onOpenChange={setAnalyticsOpen} />}
      </Suspense>
      {showFloatingChat && (
        <Suspense fallback={null}>
          <FlexChatWidget />
        </Suspense>
      )}
    </div>
  );
}
