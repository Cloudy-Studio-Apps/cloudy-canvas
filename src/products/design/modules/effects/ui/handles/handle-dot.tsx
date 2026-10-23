import type { HandleDotProps } from "./handles.types";

/** A round draggable handle of an effect on the canvas. */
export function HandleDot({ at, label, onPointerDown }: HandleDotProps) {
  return (
    <circle
      role="button"
      aria-label={label}
      cx={at.x}
      cy={at.y}
      r={5.5}
      strokeWidth={2}
      className="pointer-events-auto cursor-move fill-surface stroke-foreground/70"
      onPointerDown={onPointerDown}
    />
  );
}
