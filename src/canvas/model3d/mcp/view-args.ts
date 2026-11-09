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
 * Throws when an agent's element patch sets `angle` or `zoom`: they only change through the view
 * tool, which draws the new picture (`tool` names it), so the picture never goes stale.
 */
export function rejectViewPatch(patch: object, tool: string): void {
  const field = (["angle", "zoom"] as const).find((key) => key in patch);
  if (field) throw new Error(`A model's "${field}" can't be patched: use ${tool}.`);
}
