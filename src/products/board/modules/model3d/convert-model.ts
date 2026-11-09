import { asUndoStep, MODEL_EDIT_LOCKS } from "@canvas";

import type { BoardWorkspace } from "../../board-engine.types";
import { createImage } from "../image";
import type { ModelElement } from "./model3d.types";

/**
 * Turns a model into a plain board image of its saved picture, in one undo step: the same box,
 * z-order, rotation, mirroring and lock, the model removed (the image gets a new id). Its 3D
 * assets stay until the sweep, so Ctrl+Z restores the model. Refuses (throws) while anyone, this
 * user included, has the model live. Returns the image's id.
 */
export function convertModelToImage(engine: BoardWorkspace, el: ModelElement): string {
  if (engine.service(MODEL_EDIT_LOCKS).holderOf(el.id) !== null) {
    throw new Error("This model is being edited. Finish the edit, then try again.");
  }
  const image = {
    ...createImage(el.pictureAssetId, el, el.index),
    ...(el.rotation === undefined ? {} : { rotation: el.rotation }),
    ...(el.mirrored === undefined ? {} : { mirrored: el.mirrored }),
    ...(el.locked === undefined ? {} : { locked: el.locked }),
  };
  asUndoStep(engine.doc, () => {
    engine.doc.remove([el.id]);
    engine.doc.add(image);
  });
  return image.id;
}
