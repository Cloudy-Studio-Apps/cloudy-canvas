import { GlobalLoader } from "@shared/ui/components/loading-screen";
import { Toaster } from "@shared/ui/components/toaster";
import { TooltipProvider } from "@shared/ui/components/ui/tooltip";
import { AgentServer } from "./agent-server";
import { OpenRequests } from "./open-requests";
import { ThemeSync } from "./theme-sync";
import type { ProvidersProps } from "./providers.types";

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      <ThemeSync />
      <AgentServer />
      <OpenRequests />
      {children}
      <GlobalLoader />
      <Toaster />
    </TooltipProvider>
  );
}
