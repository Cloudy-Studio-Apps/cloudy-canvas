import type { BoardWorkspace } from "../../../board-engine.types";
import type { ModelElement } from "../model3d.types";

/** The model with this id, or an error saying what it is instead. */
export function requireModel(engine: BoardWorkspace, id: string): ModelElement {
  const el = engine.getElement(id);
  if (!el) throw new Error(`No shape with id ${id}.`);
  if (el.type !== "model3d") throw new Error(`${id} is a ${el.type}, not a 3D model.`);
  return el as ModelElement;
}
