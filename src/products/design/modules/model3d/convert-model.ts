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
] as const satisfies readonly (keyof ModelNodeElement)[];

/**
 * Turns a model into a rectangle filled with its saved picture, in one undo step: the same box,
 * name, place in the tree, z-order and layer settings; the model is removed. Its 3D assets stay
 * until the sweep, so Ctrl+Z restores the model. Refuses (throws) while anyone, this user
 * included, has the model live. Returns the rectangle's id.
 */
export function convertModelToRectangle(engine: DesignWorkspace, el: ModelNodeElement): string {
  if (engine.service(MODEL_EDIT_LOCKS).holderOf(el.id) !== null) {
    throw new Error("This model is being edited. Finish the edit, then try again.");
  }
  const { x, y, w, h } = el;
  const fills = [imagePaint(el.pictureAssetId, "fill")];
  const rectangle = createRectangle({ x, y, w, h }, el.name, el.index, el.parentId, fills);
  const carried: Record<string, unknown> = {};
  for (const field of CARRIED) if (el[field] !== undefined) carried[field] = el[field];
  const next = { ...rectangle, ...carried } as RectangleElement;
  asUndoStep(engine.doc, () => {
    engine.doc.remove([el.id]);
    engine.doc.add(next);
  });
  return next.id;
}
