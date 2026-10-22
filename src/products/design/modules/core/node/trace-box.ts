import type { Graphics } from "pixi.js";

/** A box outline with rounded corners (the radius is capped at half the shorter side). */
export function traceBox(g: Graphics, w: number, h: number, radius: number): void {
  const r = Math.min(radius, w / 2, h / 2);
  if (r > 0) g.roundRect(0, 0, w, h, r);
  else g.rect(0, 0, w, h);
}
