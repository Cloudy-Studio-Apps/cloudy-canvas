import type { SolidPaint } from "./paint.types";

/** A visible, opaque flat color. */
export function solidPaint(color: string, opacity = 1): SolidPaint {
  return { type: "solid", color, opacity, visible: true };
}
