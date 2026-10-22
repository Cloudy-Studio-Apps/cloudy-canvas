import { Plus } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type {
  PanelAddButtonProps,
  PanelIconButtonProps,
  PanelSectionProps,
} from "./panel-section.types";

/** A titled block in a side panel, separated from the next by a rule. */
export function PanelSection({ title, actions, children, className }: PanelSectionProps) {
  return (
    <section className={cn("border-b px-3 py-2.5", className)}>
      <header className="flex h-6 items-center justify-between">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {actions && <div className="flex items-center gap-0.5">{actions}</div>}
      </header>
      {children && <div className="mt-2">{children}</div>}
    </section>
  );
}

/** Small square icon button used in panel headers and rows. */
export function PanelIconButton({ label, children, active }: PanelIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-hover hover:text-foreground [&_svg]:size-3.5",
        active && "bg-primary-soft text-primary-soft-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** The "+" in a section header that adds an item (a fill, an export). */
export function PanelAddButton({ label }: PanelAddButtonProps) {
  return (
    <PanelIconButton label={label}>
      <Plus />
    </PanelIconButton>
  );
}
