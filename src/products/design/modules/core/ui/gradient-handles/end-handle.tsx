import type { EndHandleProps } from "./gradient-handles.types";

/** A round handle of a gradient on the canvas (an end, its center or its width). */
export function EndHandle({ at, label, small = false, onPointerDown }: EndHandleProps) {
  return (
    <circle
      role="button"
      aria-label={label}
      cx={at.x}
      cy={at.y}
      r={small ? 4.5 : 5.5}
      strokeWidth={2}
      className="pointer-events-auto cursor-move fill-surface stroke-foreground/70"
      onPointerDown={onPointerDown}
    />
  );
}
