import { ZOOM_RANGE } from "../model3d.constants";
import type { ModelRotation } from "../model3d.types";

type Args = Record<string, unknown>;

/** `angle` as `{ x, y, z }` in degrees, or `undefined` when absent. */
export function angleArg(args: Args): ModelRotation | undefined {
  const value = args.angle;
  if (value === undefined || value === null) return undefined;
  const angle = value as Partial<Record<"x" | "y" | "z", unknown>>;
  const finite = (axis: "x" | "y" | "z") =>
    typeof angle[axis] === "number" && Number.isFinite(angle[axis]);
  if (typeof value !== "object" || !finite("x") || !finite("y") || !finite("z")) {
    throw new Error('"angle" must be { x, y, z }, finite numbers in degrees.');
  }
  return { x: angle.x as number, y: angle.y as number, z: angle.z as number };
}

/** `zoom` within the allowed range, or `undefined` when absent. */
export function zoomArg(args: Args): number | undefined {
  const zoom = args.zoom;
  if (zoom === undefined || zoom === null) return undefined;
  if (typeof zoom !== "number" || !(zoom >= ZOOM_RANGE.min && zoom <= ZOOM_RANGE.max)) {
    throw new Error(`"zoom" must be a number between ${ZOOM_RANGE.min} and ${ZOOM_RANGE.max}.`);
  }
  return zoom;
}

/**
 * An element patch's `angle` and `zoom` checked (what a model kind's `completePatch` does), with
 * `angle` copied to a plain `{ x, y, z }`.
 */
export function checkViewPatch<P extends { angle?: unknown; zoom?: unknown }>(patch: P): P {
  const { angle, zoom } = patch;
  const checked: Args = { ...patch };
  if (angle !== undefined) {
    checked.angle = angleArg({ angle });
    if (checked.angle === undefined) {
      throw new Error('"angle" must be { x, y, z }, finite numbers in degrees.');
    }
  }
  if (zoom !== undefined) {
    if (typeof zoom !== "number") {
      throw new Error(`"zoom" must be between ${ZOOM_RANGE.min} and ${ZOOM_RANGE.max}.`);
    }
    zoomArg({ zoom });
  }
  return checked as P;
}
