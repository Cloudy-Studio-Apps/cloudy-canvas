import { useEffect, useReducer } from "react";
import type { Point } from "@canvas";

import { useService } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { CONNECT_DRAG } from "../../mode";
import { dragPath } from "./drag-path";
import { useConnectToast } from "./use-connect-toast";

/** How far (screen px) the target's dashed outline sits outside the screen. */
const OUTLINE_OFFSET = 3;

/**
 * The link being dragged (`CONNECT_DRAG`): its curve from the layer to the pointer, and a dashed
 * outline round the screen it would link to. Says what a drop added in a toast.
 */
export function DragLine() {
  const engine = useDesignEngine();
  const drag = useService(CONNECT_DRAG);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  useEffect(() => engine.onViewChange(redraw), [engine]);
  useEffect(() => drag.onChange(redraw), [drag]);
  useConnectToast();

  const state = drag.state();
  if (!state) return null;
  const point = (p: Point): Point => engine.worldRectToScreen({ ...p, w: 0, h: 0 });
  const target = state.target === null ? undefined : engine.getElement(state.target);
  const outline = target && engine.worldRectToScreen(target);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {outline && (
        <div
          className="absolute border-2 border-dashed border-primary"
          style={{
            left: outline.x - OUTLINE_OFFSET,
            top: outline.y - OUTLINE_OFFSET,
            width: outline.w + OUTLINE_OFFSET * 2,
            height: outline.h + OUTLINE_OFFSET * 2,
          }}
        />
      )}
      <svg className="absolute inset-0 size-full overflow-visible">
        <path
          d={dragPath(point(state.start), point(state.at))}
          fill="none"
          className="stroke-primary"
          strokeWidth={2.5}
        />
      </svg>
    </div>
  );
}
