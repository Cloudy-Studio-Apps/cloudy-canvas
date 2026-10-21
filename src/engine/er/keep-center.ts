import type { Size } from "../geometry.types";

/** Position for a shape that changes size but should stay centered where it was. */
export function keepCenter(
  existing: { x: number; y: number; w: number; h: number } | undefined,
  size: Size,
): { x: number; y: number } {
  if (!existing) return { x: 0, y: 0 };
  return {
    x: Math.round(existing.x + existing.w / 2 - size.w / 2),
    y: Math.round(existing.y + existing.h / 2 - size.h / 2),
  };
}
