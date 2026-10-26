import { Check, X } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@shared/ui/kit";
import { onColor } from "../..";
import type { StripCellProps } from "./theme.types";

/** One choice in the strip: its color, its name, ✓ when it passes the token's checks. */
export const StripCell = forwardRef<HTMLButtonElement, StripCellProps>(function StripCell(
  { hex, label, selected, passes, title, onPick, wide, ...rest },
  ref,
) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: a cell of a color strip, painted its color
    <button
      ref={ref}
      type="button"
      title={title}
      aria-pressed={selected}
      onClick={onPick}
      className={cn(
        "relative flex h-13 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-semibold hover:z-10 hover:shadow-[inset_0_0_0_2px_currentColor]",
        wide && "flex-[1.6]",
        selected && "z-20 shadow-[inset_0_0_0_3px_var(--ring),inset_0_0_0_5px_var(--surface)]",
      )}
      style={{ background: hex, color: onColor(hex) }}
      {...rest}
    >
      <span className="truncate">{label}</span>
      {passes !== null &&
        (passes ? <Check className="size-3" /> : <X className="size-3 opacity-55" />)}
    </button>
  );
});
