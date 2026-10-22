import { hueColor } from "./color-math";
import type { SaturationAreaProps } from "./color.types";
import { usePointerDrag } from "./use-pointer-drag";

/** Arrow keys move by this much (Shift: ten times more). */
const KEY_STEP = 0.01;

/** The square where saturation (left to right) and brightness (bottom to top) are picked. */
export function SaturationArea({ hsv, onChange }: SaturationAreaProps) {
  const drag = usePointerDrag(({ x, y }, info) => onChange({ ...hsv, s: x, v: 1 - y }, info));

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
      {...drag}
      onKeyDown={(event) => {
        const step = event.shiftKey ? KEY_STEP * 10 : KEY_STEP;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, step],
          ArrowDown: [0, -step],
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        const clamp = (n: number) => Math.min(1, Math.max(0, n));
        onChange({ ...hsv, s: clamp(hsv.s + move[0]), v: clamp(hsv.v + move[1]) }, { done: true });
      }}
      className="relative aspect-square w-full cursor-crosshair touch-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        // A picker graphic, not a theme color: white to the hue, then black from the bottom.
        background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor(hsv.h)})`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-xs"
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
      />
    </div>
  );
}
