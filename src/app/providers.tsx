import { TooltipProvider } from "@ui/components/ui/tooltip";
import { ThemeSync } from "./theme-sync";
import type { ProvidersProps } from "./providers.types";

export function Providers({ children }: ProvidersProps) {
  return (
    <TooltipProvider>
      <ThemeSync />
      {children}
    </TooltipProvider>
  );
}
