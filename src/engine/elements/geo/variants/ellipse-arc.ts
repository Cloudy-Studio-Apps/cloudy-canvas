const ELLIPSE_SEGMENTS = 32;

/** Points along an ellipse from angle `a0` to `a1` (radians, clockwise on screen). */
export function ellipseArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
): number[] {
  const points: number[] = [];
  const steps = Math.max(2, Math.ceil((ELLIPSE_SEGMENTS * Math.abs(a1 - a0)) / (2 * Math.PI)));
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    points.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
  }
  return points;
}
