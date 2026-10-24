import type { Point } from "../geometry.types";

/**
 * An SVG elliptical arc (from `from` to `to`, radii, x axis turn in degrees, flags) as cubics
 * (`[c1, c2, to]`, one per quarter turn at most). Radii too small to reach are scaled up, and a
 * zero radius is a straight line, as the SVG spec says.
 */
export function arcToCubics(
  from: Point,
  rx: number,
  ry: number,
  angle: number,
  large: boolean,
  sweep: boolean,
  to: Point,
): [Point, Point, Point][] {
  if (from.x === to.x && from.y === to.y) return [];
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (rx === 0 || ry === 0) return [[from, to, to]];
  const phi = (angle * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  const reach = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (reach > 1) {
    rx *= Math.sqrt(reach);
    ry *= Math.sqrt(reach);
  }
  const sign = large === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const k = sign * Math.sqrt(Math.max(0, num / den));
  const cx1 = (k * rx * y1) / ry;
  const cy1 = (-k * ry * x1) / rx;
  const cx = cos * cx1 - sin * cy1 + (from.x + to.x) / 2;
  const cy = sin * cx1 + cos * cy1 + (from.y + to.y) / 2;

  const vector = (ux: number, uy: number, vx: number, vy: number) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const start = vector(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let delta = vector((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const parts = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2) - 1e-9));
  const step = delta / parts;
  const t = (4 / 3) * Math.tan(step / 4);
  const point = (a: number): Point => ({
    x: cx + rx * Math.cos(a) * cos - ry * Math.sin(a) * sin,
    y: cy + rx * Math.cos(a) * sin + ry * Math.sin(a) * cos,
  });
  const tangent = (a: number): Point => ({
    x: -rx * Math.sin(a) * cos - ry * Math.cos(a) * sin,
    y: -rx * Math.sin(a) * sin + ry * Math.cos(a) * cos,
  });
  const curves: [Point, Point, Point][] = [];
  for (let i = 0; i < parts; i++) {
    const a1 = start + i * step;
    const a2 = a1 + step;
    const p1 = point(a1);
    const p2 = i === parts - 1 ? to : point(a2);
    const d1 = tangent(a1);
    const d2 = tangent(a2);
    curves.push([
      { x: p1.x + t * d1.x, y: p1.y + t * d1.y },
      { x: p2.x - t * d2.x, y: p2.y - t * d2.y },
      p2,
    ]);
  }
  return curves;
}
