import { asUndoStep, MODEL_EDIT_LOCKS } from "@canvas";

import type { DesignWorkspace } from "../../design-engine.types";
import { imagePaint } from "../core";
import { createRectangle, type RectangleElement } from "../rectangle";
import type { ModelNodeElement } from "./model3d.types";

/** The layer fields a rectangle takes over from the model it replaces. */
const CARRIED = [
  "rotation",
  "mirrored",
  "locked",
  "pageId",
  "visible",
  "opacity",
  "blendMode",
  "isMask",
  "maskType",
  "maskInverted",
  "effects",
  "exports",
  "sizing",
  "layoutAbsolute",
  "sizeLimits",
  "bindings",
  "variableModes",
] as const satisfies readonly (keyof ModelNodeElement)[];

/** Stored fields of other modules a node may carry (untyped here), taken over as they are. */
const CARRIED_EXTRA = ["interactions"] as const;

/**
 * Turns a model into a rectangle filled with its saved picture, in one undo step: the same box,
 * name, place in the tree, z-order, layer settings, variable bindings and prototype interactions;
 * the picture drawn as the model showed it ("fit"); the model is removed (the rectangle gets a new
 * id). Its 3D assets stay until the sweep, so Ctrl+Z restores the model. Refuses (throws) while
 * anyone, this user included, has the model live. Returns the rectangle's id.
 */
export function convertModelToRectangle(engine: DesignWorkspace, el: ModelNodeElement): string {
  if (engine.service(MODEL_EDIT_LOCKS).holderOf(el.id) !== null) {
    throw new Error("This model is being edited. Finish the edit, then try again.");
  }
  const { x, y, w, h } = el;
  // "fit", as the model's kind draws its picture, so the rectangle looks the same.
  const fills = [imagePaint(el.pictureAssetId, "fit")];
  const rectangle = createRectangle({ x, y, w, h }, el.name, el.index, el.parentId, fills);
  const carried: Record<string, unknown> = {};
  for (const field of CARRIED) if (el[field] !== undefined) carried[field] = el[field];
  const stored = el as unknown as Record<string, unknown>;
  for (const field of CARRIED_EXTRA)
    if (stored[field] !== undefined) carried[field] = stored[field];
  const next = { ...rectangle, ...carried } as RectangleElement;
  asUndoStep(engine.doc, () => {
    engine.doc.remove([el.id]);
    engine.doc.add(next);
  });
  return next.id;
}
