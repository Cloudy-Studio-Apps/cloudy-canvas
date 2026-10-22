import {
  defaultGradientTransform,
  invertAffine,
  parseCssGradient,
  squareWidth,
  transformFromHandles,
  type ColorStop,
  type GradientInterpolation,
  type GradientTransform,
  type GradientType,
  type Size,
  type StopEase,
} from "@canvas";

import { fraction } from "./number-args";
import { hexColor } from "./paint-args-color";
import type { GradientPaint } from "./paint.types";

export const GRADIENT_PAINT_TYPES: readonly GradientType[] = [
  "linear",
  "radial",
  "angular",
  "diamond",
];
const EASES: readonly StopEase[] = ["linear", "ease-in", "ease-out", "ease-in-out"];
const INTERPOLATIONS: readonly GradientInterpolation[] = ["srgb", "oklab"];

/** Whether `value` reads as a CSS gradient (`linear-gradient(…)`, …). */
export function isCssGradient(value: unknown): value is string {
  return (
    typeof value === "string" && /^\s*(repeating-)?(linear|radial|conic)-gradient\(/i.test(value)
  );
}

/** A CSS gradient as a visible paint on a box of `size`; throws naming `key` when it isn't one. */
export function cssGradientPaint(value: string, key: string, size?: Size): GradientPaint {
  try {
    return { ...parseCssGradient(value, size), opacity: 1, visible: true };
  } catch (error) {
    throw new Error(`"${key}": ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
}

function point(value: unknown, key: string): { x: number; y: number } {
  const p = value as { x?: unknown; y?: unknown } | null;
  if (typeof p?.x !== "number" || typeof p.y !== "number" || !Number.isFinite(p.x + p.y)) {
    throw new Error(`"${key}" must be a point { x, y } in the layer's box (0–1 on each axis).`);
  }
  return { x: p.x, y: p.y };
}

function readStops(value: unknown, key: string): ColorStop[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(
      `"${key}" must be an array of at least two stops { position, color, opacity?, ease? }.`,
    );
  }
  return value.map((item, i) => {
    const stop = (item ?? {}) as Record<string, unknown>;
    const at = `${key}[${i}]`;
    const read: ColorStop = {
      position: fraction(stop.position, `${at}.position`),
      color: hexColor(stop.color, `${at}.color`),
      opacity: stop.opacity === undefined ? 1 : fraction(stop.opacity, `${at}.opacity`),
    };
    if (stop.ease !== undefined) {
      if (!EASES.includes(stop.ease as StopEase)) {
        throw new Error(`"${at}.ease" must be one of: ${EASES.join(", ")}.`);
      }
      if (stop.ease !== "linear") read.ease = stop.ease as StopEase;
    }
    return read;
  });
}

function readTransform(value: unknown, key: string): GradientTransform {
  const rows = value as unknown[][];
  const valid =
    Array.isArray(rows) &&
    rows.length === 2 &&
    rows.every((row) => Array.isArray(row) && row.length === 3 && row.every(Number.isFinite));
  if (!valid) throw new Error(`"${key}" must be a 2×3 matrix [[a, c, e], [b, d, f]].`);
  const transform = rows as unknown as GradientTransform;
  if (!invertAffine(transform)) throw new Error(`"${key}" can't be flat (it has no inverse).`);
  return transform;
}

/**
 * Where a gradient lies, from (first found) `transform`, `from`/`to` (and `width`) handles, a
 * linear `angle` (CSS degrees: 0 up, 90 right) or the type's default.
 */
function readPlacement(
  type: GradientType,
  paint: Record<string, unknown>,
  key: string,
  size: Size,
): GradientTransform {
  if (paint.transform !== undefined) return readTransform(paint.transform, `${key}.transform`);
  if (paint.from !== undefined || paint.to !== undefined) {
    const start = point(paint.from, `${key}.from`);
    const end = point(paint.to, `${key}.to`);
    const width =
      paint.width !== undefined
        ? point(paint.width, `${key}.width`)
        : squareWidth(start, end, size, 1);
    return transformFromHandles(type, { start, end, width }, size);
  }
  if (paint.angle !== undefined) {
    if (type !== "linear") throw new Error(`"${key}.angle" is only for linear gradients.`);
    if (typeof paint.angle !== "number" || !Number.isFinite(paint.angle)) {
      throw new Error(`"${key}.angle" must be a number of degrees.`);
    }
    return parseCssGradient(`linear-gradient(${paint.angle}deg, #000, #000)`, size).transform;
  }
  return defaultGradientTransform(type);
}

/** A gradient paint given in full (its `type` already checked to be a gradient's). */
export function readGradientPaint(
  paint: Record<string, unknown>,
  key: string,
  base: { opacity: number; visible: boolean },
  size: Size = { w: 1, h: 1 },
): GradientPaint {
  const type = paint.type as GradientType;
  const read: GradientPaint = {
    type,
    stops: readStops(paint.stops, `${key}.stops`),
    transform: readPlacement(type, paint, key, size),
    ...base,
  };
  if (paint.interpolation !== undefined) {
    if (!INTERPOLATIONS.includes(paint.interpolation as GradientInterpolation)) {
      throw new Error(`"${key}.interpolation" must be one of: ${INTERPOLATIONS.join(", ")}.`);
    }
    if (paint.interpolation !== "srgb")
      read.interpolation = paint.interpolation as GradientInterpolation;
  }
  return read;
}
