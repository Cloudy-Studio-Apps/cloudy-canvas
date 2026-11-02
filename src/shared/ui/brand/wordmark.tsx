import { cn } from "@shared/ui/lib/utils";
import { SealLogo } from "./seal-logo";
import type { WordmarkProps } from "./wordmark.types";

export function Wordmark({ className, textClassName }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SealLogo size={30} />
      <span className={cn("text-md font-semibold tracking-tight text-foreground", textClassName)}>
        Cloudy Canvas
      </span>
    </span>
  );
}
