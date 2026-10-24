import type { Point } from "../geometry.types";
import type { PathContour, PathShape } from "../path";
import { parseSvgPath } from "./svg-path-data";

/** How far a cubic's handles reach to draw a quarter circle. */
const KAPPA = 0.5522847498;

/** The outline an SVG shape element draws, in its own user space; `null` for other tags. */
export function svgElementShape(el: Element): PathShape | null {
  const n = (name: string) => number(el.getAttribute(name));
  switch (el.tagName.toLowerCase()) {
    case "path":
      return parseSvgPath(el.getAttribute("d") ?? "");
    case "rect": {
      const [w, h] = [n("width"), n("height")];
      if (w <= 0 || h <= 0) return null;
      const rxAttr = el.getAttribute("rx");
      const ryAttr = el.getAttribute("ry");
      const rx = Math.min(w / 2, number(rxAttr ?? ryAttr));
      const ry = Math.min(h / 2, number(ryAttr ?? rxAttr));
      return { contours: [roundedRect(n("x"), n("y"), w, h, rx, ry)] };
    }
    case "circle": {
      const r = n("r");
      return r > 0 ? { contours: [ellipse(n("cx"), n("cy"), r, r)] } : null;
    }
    case "ellipse": {
      const [rx, ry] = [n("rx"), n("ry")];
      return rx > 0 && ry > 0 ? { contours: [ellipse(n("cx"), n("cy"), rx, ry)] } : null;
    }
    case "line":
      return {
        contours: [
          polyline(
            [
              { x: n("x1"), y: n("y1") },
              { x: n("x2"), y: n("y2") },
            ],
            false,
          ),
        ],
      };
    case "polyline":
    case "polygon": {
      const values = (el.getAttribute("points") ?? "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      const points: Point[] = [];
      for (let i = 0; i + 1 < values.length; i += 2) {
        points.push({ x: values[i] ?? 0, y: values[i + 1] ?? 0 });
      }
      if (points.length < 2) return null;
      return { contours: [polyline(points, el.tagName.toLowerCase() === "polygon")] };
    }
    default:
      return null;
  }
}

/** A length attribute as a number (units ignored, missing is 0). */
export function number(value: string | null): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function polyline(points: readonly Point[], closed: boolean): PathContour {
  const [first = { x: 0, y: 0 }, ...rest] = points;
  const ends = closed ? [...rest, first] : rest;
  return {
    start: first,
    segments: ends.map((to, i) => {
      const from = i === 0 ? first : (ends[i - 1] ?? first);
      return { c1: from, c2: to, to };
    }),
    closed,
  };
}

function ellipse(cx: number, cy: number, rx: number, ry: number): PathContour {
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  return {
    start: { x: cx + rx, y: cy },
    segments: [
      { c1: { x: cx + rx, y: cy + ky }, c2: { x: cx + kx, y: cy + ry }, to: { x: cx, y: cy + ry } },
      { c1: { x: cx - kx, y: cy + ry }, c2: { x: cx - rx, y: cy + ky }, to: { x: cx - rx, y: cy } },
      { c1: { x: cx - rx, y: cy - ky }, c2: { x: cx - kx, y: cy - ry }, to: { x: cx, y: cy - ry } },
      { c1: { x: cx + kx, y: cy - ry }, c2: { x: cx + rx, y: cy - ky }, to: { x: cx + rx, y: cy } },
    ],
    closed: true,
  };
}

function roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number) {
  if (rx <= 0 || ry <= 0) {
    return polyline(
      [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ],
      true,
    );
  }
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  const r = x + w;
  const b = y + h;
  const line = (to: Point, from: Point) => ({ c1: from, c2: to, to });
  const contour: PathContour = {
    start: { x: x + rx, y },
    segments: [
      line({ x: r - rx, y }, { x: x + rx, y }),
      { c1: { x: r - rx + kx, y }, c2: { x: r, y: y + ry - ky }, to: { x: r, y: y + ry } },
      line({ x: r, y: b - ry }, { x: r, y: y + ry }),
      { c1: { x: r, y: b - ry + ky }, c2: { x: r - rx + kx, y: b }, to: { x: r - rx, y: b } },
      line({ x: x + rx, y: b }, { x: r - rx, y: b }),
      { c1: { x: x + rx - kx, y: b }, c2: { x, y: b - ry + ky }, to: { x, y: b - ry } },
      line({ x, y: y + ry }, { x, y: b - ry }),
      { c1: { x, y: y + ry - ky }, c2: { x: x + rx - kx, y }, to: { x: x + rx, y } },
    ],
    closed: true,
  };
  return contour;
}
