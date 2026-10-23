import { createPortal } from "react-dom";

import type { DropIndicatorProps } from "./drop-indicator.types";

/** Room the line leaves for the row's chevron, in pixels. */
const CHEVRON = 16;

/**
 * Where a drag in the layers list would drop: a line between rows, indented to the level the
 * layers would go to (a row they'd go into is outlined by the row itself), and a label with what's
 * dragged next to the pointer.
 */
export function DropIndicator({ drag, metrics }: DropIndicatorProps) {
  const line = drag.drop?.line;
  return (
    <>
      {line && (
        <div
          aria-hidden
          className="pointer-events-none absolute right-1 z-10 flex items-center"
          style={{
            top: line.boundary * metrics.rowHeight - 3,
            left: metrics.baseIndent + line.depth * metrics.indent + CHEVRON,
          }}
        >
          <span className="size-1.5 shrink-0 border border-primary bg-surface" />
          <span className="h-0.5 flex-1 bg-primary" />
        </div>
      )}
      {createPortal(
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 max-w-48 truncate rounded-md border bg-surface px-2 py-0.5 text-xs text-foreground shadow-sm"
          style={{ left: drag.pointer.x + 14, top: drag.pointer.y + 10 }}
        >
          {drag.label}
        </div>,
        document.body,
      )}
    </>
  );
}
