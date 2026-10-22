import type { GradientType } from "./gradient.types";

const TAU = Math.PI * 2;

/** How far along the gradient (0–1, unclamped) the gradient-space point (`gx`, `gy`) is. */
export function gradientParam(type: GradientType, gx: number, gy: number): number {
  const dx = gx - 0.5;
  const dy = gy - 0.5;
  switch (type) {
    case "linear":
      return gx;
    case "radial":
      return Math.hypot(dx, dy) * 2;
    case "diamond":
      return (Math.abs(dx) + Math.abs(dy)) * 2;
    case "angular": {
      const turn = Math.atan2(dy, dx) / TAU;
      return turn < 0 ? turn + 1 : turn;
    }
  }
}
