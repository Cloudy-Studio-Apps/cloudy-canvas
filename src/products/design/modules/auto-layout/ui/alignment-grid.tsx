import type { LayoutAlign, LayoutCounterAlign } from "../../core";
import { cn } from "@shared/ui/lib/utils";
import type { AlignmentGridProps } from "./alignment-grid.types";

const PLACES = ["start", "center", "end"] as const;

/**
 * Figma's alignment box: nine cells, one per place of the layers along and across the layout's
 * direction (rows are vertical places, columns horizontal ones). With space between, only the
 * place across it is picked, so a whole row (or column) shows it.
 */
export function AlignmentGrid({ layout, onPick }: AlignmentGridProps) {
  const horizontal = layout.direction === "horizontal";
  const spread = layout.align === "space-between";
  return (
    <div
      role="radiogroup"
      aria-label="Alignment"
      className="grid size-[60px] shrink-0 grid-cols-3 grid-rows-3 rounded-sm bg-muted p-1"
    >
      {PLACES.map((row) =>
        PLACES.map((column) => {
          const align: LayoutAlign = spread ? "space-between" : horizontal ? column : row;
          const counter: LayoutCounterAlign = horizontal ? row : column;
          const along = horizontal ? column : row;
          const active =
            (layout.counterAlign === counter ||
              (layout.counterAlign === "baseline" && counter === "start")) &&
            (spread || layout.align === along);
          return (
            // eslint-disable-next-line no-restricted-syntax -- bespoke: auto layout's 3×3 alignment dots
            <button
              key={`${row}-${column}`}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`Align ${row} ${column}`}
              title={`${row} ${column}`}
              onClick={() => onPick({ align, counterAlign: counter })}
              className="group flex cursor-pointer items-center justify-center"
            >
              <span
                className={cn(
                  "size-1 rounded-[1px] bg-muted-foreground/50 group-hover:bg-foreground",
                  active && "h-2.5 w-1.5 bg-primary group-hover:bg-primary",
                  active && horizontal && "h-1.5 w-2.5",
                )}
              />
            </button>
          );
        }),
      )}
    </div>
  );
}
