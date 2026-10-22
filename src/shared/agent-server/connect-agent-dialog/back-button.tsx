import { ChevronLeft } from "lucide-react";

import { Button } from "@shared/ui/components/ui/button";
import type { BackButtonProps } from "./connect-agent-dialog.types";

/** Goes back to the view the current one was opened from. */
export function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 self-start" onClick={onClick}>
      <ChevronLeft />
      {label}
    </Button>
  );
}
