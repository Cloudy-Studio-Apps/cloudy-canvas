import type { RowDropSide } from "./row-drag.types";

/** Classes that draw a drop line on a `relative` row: `null` for none. */
export function rowDropLine(side: RowDropSide | null): string {
  if (side === "before") {
    return "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary";
  }
  if (side === "after") {
    return "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary";
  }
  return "";
}
