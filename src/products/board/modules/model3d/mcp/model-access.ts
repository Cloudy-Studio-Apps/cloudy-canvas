import { MODEL_EDIT_LOCKS, ZOOM_RANGE, type ModelRotation, type ToolArgs } from "@canvas";

import type { BoardWorkspace } from "../../../board-engine.types";
import type { ModelElement } from "../model3d.types";

/** The model with this id, or an error saying what it is instead. */
export function requireModel(engine: BoardWorkspace, id: string): ModelElement {
  const el = engine.getElement(id);
  if (!el) throw new Error(`No shape with id ${id}.`);
  if (el.type !== "model3d") throw new Error(`${id} is a ${el.type}, not a 3D model.`);
  return el as ModelElement;
}

/** Throws when the board is read-only or anyone (the user too) has the model live. */
export function assertModelFree(engine: BoardWorkspace, id: string): void {
  if (engine.doc.isReadOnly) throw new Error("This board is read-only.");
  const holder = engine.service(MODEL_EDIT_LOCKS).holderOf(id);
  if (holder === null) return;
  const who = holder === "self" ? "the user" : "someone else";
  throw new Error(`This model is being edited by ${who}. Wait until they finish, then try again.`);
}

/** `angle` as `{ x, y, z }` in degrees, or `undefined` when absent. */
export function angleArg(args: ToolArgs): ModelRotation | undefined {
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
export function zoomArg(args: ToolArgs): number | undefined {
  const zoom = args.zoom;
  if (zoom === undefined || zoom === null) return undefined;
  if (typeof zoom !== "number" || !(zoom >= ZOOM_RANGE.min && zoom <= ZOOM_RANGE.max)) {
    throw new Error(`"zoom" must be a number between ${ZOOM_RANGE.min} and ${ZOOM_RANGE.max}.`);
  }
  return zoom;
}
