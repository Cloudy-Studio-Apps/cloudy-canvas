import { cn } from "@shared/ui/kit";
import type { SectionLabelProps } from "./colors.types";

/** A small upper-case heading over a source's part, with an optional note on the right. */
export function SectionLabel({ children, aside, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-baseline justify-between gap-2", className)}>
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {children}
      </span>
      {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
    </div>
  );
}
