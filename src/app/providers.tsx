import { TooltipProvider } from "@ui/components/ui/tooltip";
import { AgentServer } from "./agent-server";
import { ThemeSync } from "./theme-sync";
import type { ProvidersProps } from "./providers.types";

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      <ThemeSync />
      <AgentServer />
      {children}
    </TooltipProvider>
  );
}
