import type { CanvasEngine } from "@canvas";
import type { ModelNodeElement } from "../model3d.types";

/** The model when exactly one layer is selected and it is one; otherwise `null`. */
export function selectedModel(engine: CanvasEngine<object>): ModelNodeElement | null {
  const [id, ...others] = engine.selectedIds();
  const el = id && others.length === 0 ? engine.getElement(id) : undefined;
  return el?.type === "model3d" ? (el as ModelNodeElement) : null;
}
