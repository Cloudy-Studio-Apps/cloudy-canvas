import { IDENTITY_TRANSFORM, multiplyAffine } from "../gradient";
import type { SvgMatrix } from "./svg.types";

const FUNCTION = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;

/** A `transform` attribute's list, applied right to left as SVG does; identity when empty. */
export function parseSvgTransform(text: string | null): SvgMatrix {
  let matrix: SvgMatrix = IDENTITY_TRANSFORM;
  if (!text) return matrix;
  for (const [, name, args] of text.matchAll(FUNCTION)) {
    const n = (args ?? "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const v = (i: number, fallback = 0) => (Number.isFinite(n[i]) ? (n[i] as number) : fallback);
    matrix = multiplyAffine(matrix, transformOf(name ?? "", v, n.length));
  }
  return matrix;
}

function transformOf(name: string, v: (i: number, fallback?: number) => number, count: number) {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  switch (name) {
    case "matrix":
      return [
        [v(0, 1), v(2), v(4)],
        [v(1), v(3, 1), v(5)],
      ] as SvgMatrix;
    case "translate":
      return [
        [1, 0, v(0)],
        [0, 1, v(1)],
      ] as SvgMatrix;
    case "scale": {
      const sx = v(0, 1);
      const sy = count > 1 ? v(1, 1) : sx;
      return [
        [sx, 0, 0],
        [0, sy, 0],
      ] as SvgMatrix;
    }
    case "rotate": {
      const a = rad(v(0));
      const [cx, cy] = [v(1), v(2)];
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      return [
        [cos, -sin, cx - cos * cx + sin * cy],
        [sin, cos, cy - sin * cx - cos * cy],
      ] as SvgMatrix;
    }
    case "skewX":
      return [
        [1, Math.tan(rad(v(0))), 0],
        [0, 1, 0],
      ] as SvgMatrix;
    case "skewY":
      return [
        [1, 0, 0],
        [Math.tan(rad(v(0))), 1, 0],
      ] as SvgMatrix;
    default:
      return IDENTITY_TRANSFORM;
  }
}

/** How much a matrix scales lengths (stroke widths), on average. */
export function matrixScale([[a, c], [b, d]]: SvgMatrix): number {
  return Math.sqrt(Math.abs(a * d - b * c));
}
