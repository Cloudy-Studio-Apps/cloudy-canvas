import type { ReactNode } from "react";

import { TooltipProvider } from "@ui/components/ui/tooltip";
import { ThemeSync } from "./theme-sync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ThemeSync />
      {children}
    </TooltipProvider>
  );
}
