import { Eye, Minus } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import { PanelIconButton } from "./panel-section";
import type { ColorFieldProps, PropertyFieldProps, PropertyRowProps } from "./property-field.types";

/** A compact value box: a prefix and an editable value, like X 120. */
export function PropertyField({ prefix, value, suffix, label, className }: PropertyFieldProps) {
  return (
    <label
      className={cn(
        "flex h-7 min-w-0 items-center gap-1.5 rounded-sm border border-transparent bg-muted px-2 text-xs focus-within:border-ring focus-within:bg-surface hover:border-border",
        className,
      )}
    >
      <span className="flex w-3 shrink-0 justify-center text-subtle-foreground [&_svg]:size-3">
        {prefix}
      </span>
      <input
        aria-label={label}
        defaultValue={value}
        className="min-w-0 flex-1 bg-transparent text-foreground tabular-nums outline-none"
      />
      {suffix && <span className="text-subtle-foreground">{suffix}</span>}
    </label>
  );
}

/** A two-column grid of fields with an optional trailing control. */
export function PropertyRow({ children, className }: PropertyRowProps) {
  return <div className={cn("grid grid-cols-2 gap-2", className)}>{children}</div>;
}

/** A paint: swatch and hex, its opacity, and visibility/remove controls. */
export function ColorField({ color, opacity, label }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-1">
      <label className="flex h-7 min-w-0 flex-1 items-center rounded-sm border border-transparent bg-muted text-xs focus-within:border-ring focus-within:bg-surface hover:border-border">
        <span className="flex flex-1 items-center gap-2 px-2">
          <span
            className="size-3.5 shrink-0 rounded-xs border border-border-strong"
            style={{ backgroundColor: color }}
          />
          <input
            aria-label={label}
            defaultValue={color.replace("#", "").toUpperCase()}
            className="min-w-0 flex-1 bg-transparent font-mono text-foreground uppercase outline-none"
          />
        </span>
        <span className="flex h-full w-14 items-center gap-0.5 border-l border-surface px-2 tabular-nums">
          <input
            aria-label={`${label} opacity`}
            defaultValue={opacity}
            className="w-full min-w-0 bg-transparent text-foreground outline-none"
          />
          <span className="text-subtle-foreground">%</span>
        </span>
      </label>
      <PanelIconButton label="Hide">
        <Eye />
      </PanelIconButton>
      <PanelIconButton label="Remove">
        <Minus />
      </PanelIconButton>
    </div>
  );
}
