import { clamp } from "@canvas";

import { CHECKERBOARD, COLOR_KEY_STEP } from "./color-constants";
import type { ColorSliderProps } from "./color.types";
import { usePointerDrag } from "./use-pointer-drag";

/** A horizontal track with a thumb, e.g. hue or opacity. */
export function ColorSlider({ label, value, track, checkered, onChange }: ColorSliderProps) {
  const drag = usePointerDrag(({ x }, info) => onChange(x, info));

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      {...drag}
      onKeyDown={(event) => {
        const step = (event.shiftKey ? 10 : 1) * COLOR_KEY_STEP;
        const delta = event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0;
        if (delta === 0) return;
        event.preventDefault();
        onChange(clamp(value + delta, 0, 1), { done: true });
      }}
      className="relative h-3 w-full cursor-pointer touch-none rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ background: checkered ? `${track}, ${CHECKERBOARD}` : track }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xs"
        style={{ left: `${value * 100}%` }}
      />
    </div>
  );
}
