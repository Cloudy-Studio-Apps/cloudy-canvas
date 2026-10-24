import { cn } from "@shared/ui/lib/utils";
import type { PageBadgeProps } from "./canvas.types";

/** A brochure page's number on its frame's top-left corner (lighter for an option not printed). */
export function PageBadge({ rect, label, printed }: PageBadgeProps) {
  return (
    <span
      className={cn(
        "absolute flex h-5 min-w-5 items-center justify-center rounded-sm px-1 text-[11px] font-bold tabular-nums shadow-soft",
        printed
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-surface text-primary-soft-foreground",
      )}
      style={{ left: rect.x + 6, top: rect.y + 6 }}
    >
      {label}
    </span>
  );
}
