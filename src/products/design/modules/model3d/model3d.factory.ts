import type { ModelData, Rect } from "@canvas";

import { createNodeBase } from "../core";
import type { ModelNodeElement } from "./model3d.types";

/**
 * A model layer filling `rect`, at the top of the page, from the data stored when the file was
 * imported. It is named after the file (without its extension) unless `name` says otherwise.
 */
export function createModelNode(
  data: ModelData,
  rect: Rect,
  index: string,
  name: string = data.fileName.replace(/\.[^.]+$/, ""),
): ModelNodeElement {
  return { ...createNodeBase("model3d", rect, index, { name }), ...data };
}
