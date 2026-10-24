import { SCALE_ANCHORS } from "@canvas";
import { cn } from "@shared/ui/lib/utils";
import type { AnchorPickerProps } from "./anchor-picker.types";

/** The 3×3 grid that picks the point of the selection that stays put while it's scaled. */
export function AnchorPicker({ value, onChange }: AnchorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Scale from"
      className="grid size-14 shrink-0 grid-cols-3 place-items-center rounded-sm bg-muted p-1"
    >
      {SCALE_ANCHORS.map((anchor) => (
        // eslint-disable-next-line no-restricted-syntax -- bespoke: the 3×3 anchor dots
        <button
          key={anchor}
          type="button"
          role="radio"
          aria-checked={anchor === value}
          aria-label={anchor.replace("-", " ")}
          title={anchor.replace("-", " ")}
          onClick={() => onChange(anchor)}
          className="group flex size-4 cursor-pointer items-center justify-center"
        >
          <span
            className={cn(
              "size-1.5 rounded-[1px] bg-muted-foreground/50 group-hover:bg-foreground",
              anchor === value && "size-2 bg-primary group-hover:bg-primary",
            )}
          />
        </button>
      ))}
    </div>
  );
}
