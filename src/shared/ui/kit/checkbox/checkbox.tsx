import { Check, Minus } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { CheckboxProps } from "./checkbox.types";

/** A checkbox, with an optional label; "mixed" shows a dash. */
export function Checkbox({ checked, onCheckedChange, label, className, ...props }: CheckboxProps) {
  const on = checked === true;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === "mixed" ? "mixed" : on}
      onClick={() => onCheckedChange(!on)}
      className={cn(
        "group/check inline-flex cursor-pointer items-center gap-2 text-xs text-foreground outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "flex size-3.5 shrink-0 items-center justify-center rounded-xs border border-input bg-surface group-focus-visible/check:ring-2 group-focus-visible/check:ring-ring/40 [&_svg]:size-3",
          checked !== false && "border-primary bg-primary text-primary-foreground",
        )}
      >
        {checked === "mixed" ? <Minus /> : on && <Check />}
      </span>
      {label}
    </button>
  );
}
