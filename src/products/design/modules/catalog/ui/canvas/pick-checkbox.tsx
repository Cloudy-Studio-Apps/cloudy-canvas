import { Check } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { PickCheckboxProps } from "./canvas.types";

/** A frame's tick on its top-right corner while frames are being picked (clicks go to the canvas). */
export function PickCheckbox({ rect, ticked }: PickCheckboxProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute flex size-[18px] items-center justify-center rounded-xs border-[1.5px] shadow-soft",
        ticked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-strong bg-surface",
      )}
      style={{ left: rect.x + rect.w - 24, top: rect.y + 6 }}
    >
      {ticked && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
}
