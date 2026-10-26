import { createPortal } from "react-dom";

import { cn } from "@shared/ui/kit";
import { ErPaletteIcon } from "./er-palette-icon";
import type { ErDragGhostProps } from "./er-palette.types";

/** Follows the pointer while a palette item is dragged, saying what dropping it there does. */
export function ErDragGhostChip({ item, ghost }: ErDragGhostProps) {
  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed z-50 flex items-center gap-1.5 rounded-md border bg-surface px-2 py-1 text-xs shadow-lifted",
        ghost.ok ? "text-foreground" : "text-muted-foreground",
      )}
      style={{ left: ghost.x + 14, top: ghost.y + 14 }}
    >
      <ErPaletteIcon id={item} />
      {ghost.label}
    </div>,
    document.body,
  );
}
