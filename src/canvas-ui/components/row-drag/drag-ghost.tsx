import { createPortal } from "react-dom";

import { cn } from "@shared/ui/kit";
import type { DragGhostProps } from "./drag-ghost.types";

/** What's being dragged, in a label next to the pointer (greyed where it can't drop). */
export function DragGhost({ label, pointer, muted = false }: DragGhostProps) {
  return createPortal(
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed z-50 max-w-48 truncate rounded-md border bg-surface px-2 py-0.5 text-xs text-foreground shadow-sm",
        muted && "text-muted-foreground opacity-60",
      )}
      style={{ left: pointer.x + 14, top: pointer.y + 10 }}
    >
      {label}
    </div>,
    document.body,
  );
}
