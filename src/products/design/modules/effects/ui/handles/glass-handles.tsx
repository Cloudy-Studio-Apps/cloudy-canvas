import type { GlassEffect } from "@design";
import { HandleDot } from "./handle-dot";
import type { EffectHandlesProps } from "./handles.types";

/** Shift snaps the light's angle to steps of this many degrees. */
const ANGLE_STEP = 15;

/** Glass's light as a handle round the layer's middle: drag it to light the rim from there. */
export function GlassHandles({
  effect,
  frame,
  screen,
  startDrag,
  change,
}: EffectHandlesProps<GlassEffect>) {
  const angle = (effect.lightAngle * Math.PI) / 180;
  // Counterclockwise from the right, in the layer's box (its y points down).
  const reach = 0.42;
  const middle = screen({ x: 0.5, y: 0.5 });
  const at = screen({ x: 0.5 + Math.cos(angle) * reach, y: 0.5 - Math.sin(angle) * reach });
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
      <HandleDot
        at={at}
        label="Light direction"
        onPointerDown={(event) => {
          let first = true;
          startDrag(event, (p, e) => {
            const dx = (p.x - 0.5) * frame.w;
            const dy = (0.5 - p.y) * frame.h;
            let degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
            if (e.shiftKey) degrees = Math.round(degrees / ANGLE_STEP) * ANGLE_STEP;
            change({ ...effect, lightAngle: Math.round(((degrees % 360) + 360) % 360) }, first);
            first = false;
          });
        }}
      />
    </>
  );
}
