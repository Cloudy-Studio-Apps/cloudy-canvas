import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { SectionProps } from "./section.types";

/** A titled block of a side panel, separated from the next by a rule. */
export function Section({
  title,
  actions,
  children,
  collapsible,
  defaultOpen = true,
  className,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const shown = !collapsible || open;
  return (
    <section className={cn("border-b px-3 py-2.5", className)}>
      <header className="flex h-6 items-center justify-between gap-2">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="-ml-1 flex min-w-0 cursor-pointer items-center gap-0.5 rounded-sm pr-1 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ChevronRight
              className={cn(
                "size-3.5 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
            />
            <span className="truncate">{title}</span>
          </button>
        ) : (
          <h2 className="truncate text-xs font-semibold text-foreground">{title}</h2>
        )}
        {actions && <div className="flex items-center gap-0.5">{actions}</div>}
      </header>
      {shown && children && <div className="mt-2">{children}</div>}
    </section>
  );
}
