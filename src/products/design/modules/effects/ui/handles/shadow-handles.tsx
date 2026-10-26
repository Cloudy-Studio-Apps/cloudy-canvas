import type { DropShadowEffect, InnerShadowEffect } from "../../effect.types";
import { HandleDot } from "./handle-dot";
import type { EffectHandlesProps } from "./handles.types";

/** Shift snaps the offset's direction to steps of this many degrees. */
const ANGLE_STEP = 45;

/**
 * A shadow's offset as a handle away from the layer's middle (drag it to cast the shadow), with
 * a ring as wide as its blur. Shift keeps the direction to 45° steps.
 */
export function ShadowHandles({
  effect,
  frame,
  view,
  screen,
  startDrag,
  change,
}: EffectHandlesProps<DropShadowEffect | InnerShadowEffect>) {
  const middle = screen({ x: 0.5, y: 0.5 });
  const at = screen({
    x: 0.5 + effect.x / Math.max(frame.w, 1e-6),
    y: 0.5 + effect.y / Math.max(frame.h, 1e-6),
  });
  return (
    <>
      <line
        x1={middle.x}
        y1={middle.y}
        x2={at.x}
        y2={at.y}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        className="stroke-foreground/50"
      />
      {effect.blur > 0 && (
        <circle
          cx={at.x}
          cy={at.y}
          r={effect.blur * view.zoom}
          fill="none"
          strokeWidth={1}
          strokeDasharray="2 3"
          className="stroke-foreground/40"
        />
      )}
      <HandleDot
        at={at}
        label="Shadow offset"
        onPointerDown={(event) => {
          let first = true;
          startDrag(event, (p, e) => {
            let x = (p.x - 0.5) * frame.w;
            let y = (p.y - 0.5) * frame.h;
            if (e.shiftKey) {
              const step = (ANGLE_STEP * Math.PI) / 180;
              const angle = Math.round(Math.atan2(y, x) / step) * step;
              const length = Math.hypot(x, y);
              x = Math.cos(angle) * length;
              y = Math.sin(angle) * length;
            }
            change({ ...effect, x: Math.round(x), y: Math.round(y) }, first);
            first = false;
          });
        }}
      />
    </>
  );
}
