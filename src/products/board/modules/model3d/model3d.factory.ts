import { createElementBase, type ModelData, type Rect } from "@canvas";

import type { ModelElement } from "./model3d.types";

/** A model element filling `rect`, from the data stored when the file was imported. */
export function createModel(data: ModelData, rect: Rect, index: string): ModelElement {
  return { ...createElementBase("model3d", rect, index), ...data };
}
