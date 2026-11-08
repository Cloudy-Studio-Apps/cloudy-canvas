import type { DesignWorkspace } from "../../../design-engine.types";
import type { ModelNodeElement } from "../model3d.types";

/** The model layer with this id, or an error saying what it is instead. */
export function requireModelNode(engine: DesignWorkspace, id: string): ModelNodeElement {
  const el = engine.getElement(id);
  if (!el) throw new Error(`No layer with id ${id}.`);
  if (el.type !== "model3d") throw new Error(`${id} is a ${el.type}, not a 3D model.`);
  return el as ModelNodeElement;
}
