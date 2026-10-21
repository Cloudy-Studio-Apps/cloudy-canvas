import type { ConnectorSide, GeoKind } from "../document";
import type { Point } from "../geometry.types";

/** Slant of a parallelogram, as a share of its width. */
export const PARALLELOGRAM_SKEW = 0.2;
/** Height of a cylinder's top and bottom ellipses, as a share of its height (capped). */
const CYLINDER_CAP = 0.12;
const CYLINDER_CAP_MAX = 24;
const ELLIPSE_SEGMENTS = 32;

/** Vertical radius of a cylinder's caps. */
export function cylinderCap(w: number, h: number): number {
  return Math.min(h * CYLINDER_CAP, CYLINDER_CAP_MAX, w / 2);
}

/**
 * Closed outline of a shape as a flat [x0, y0, …] polygon in local coordinates (0,0 → w,h).
 * Rectangles, rounded rectangles and ellipses are drawn with Pixi primitives and don't use this.
 */
export function geoPolygon(kind: GeoKind, w: number, h: number): number[] {
  switch (kind) {
    case "diamond":
      return [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
    case "triangle":
      return [w / 2, 0, w, h, 0, h];
    case "parallelogram": {
      const skew = w * PARALLELOGRAM_SKEW;
      return [skew, 0, w, 0, w - skew, h, 0, h];
    }
    case "star":
      return starPolygon(w, h);
    case "cylinder": {
      const ry = cylinderCap(w, h);
      // Top half of the top cap, right side, bottom half of the bottom cap, left side.
      return [
        ...ellipseArc(w / 2, ry, w / 2, ry, Math.PI, 2 * Math.PI),
        ...ellipseArc(w / 2, h - ry, w / 2, ry, 0, Math.PI),
      ];
    }
    default:
      return [0, 0, w, 0, w, h, 0, h];
  }
}

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

/** Five-pointed star filling the box (nudged down so it looks centered). */
function starPolygon(w: number, h: number): number[] {
  const points: number[] = [];
  const inner = 0.4;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 1 : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(
      w / 2 + (w / 2) * r * Math.cos(a),
      h / 2 + (h / 2) * r * Math.sin(a) * 1.05 + h * 0.03,
    );
  }
  return points;
}

/** Where a connector leaves a shape on each side, in local coordinates. */
export function geoSideAnchor(kind: GeoKind, w: number, h: number, side: ConnectorSide): Point {
  if (side === "top") return { x: w / 2, y: 0 };
  // The star's bottom anchor is the notch between its two lower points.
  if (side === "bottom") return { x: w / 2, y: kind === "star" ? h * 0.74 : h };
  const left = side === "left";
  switch (kind) {
    case "triangle":
      return { x: left ? w / 4 : (3 * w) / 4, y: h / 2 };
    case "parallelogram": {
      const skew = (w * PARALLELOGRAM_SKEW) / 2;
      return { x: left ? skew : w - skew, y: h / 2 };
    }
    case "star":
      return { x: left ? w * 0.03 : w * 0.97, y: h * 0.37 };
    default:
      return { x: left ? 0 : w, y: h / 2 };
  }
}
