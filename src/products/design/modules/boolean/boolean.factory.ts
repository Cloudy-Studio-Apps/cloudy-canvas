import type { Rect } from "@canvas";

import { createNodeBase, type DesignNode } from "../core";
import { BOOLEAN_TYPE } from "./boolean.constants";
import type { BooleanElement, BooleanOperation } from "./boolean.types";

/** A new boolean painted like `look` (its base layer, as in Figma). */
export function createBoolean(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
  operation: BooleanOperation,
  look: Pick<DesignNode, "fills" | "strokes" | "strokeWeight" | "opacity">,
): BooleanElement {
  return {
    ...createNodeBase(BOOLEAN_TYPE, rect, index, { name, parentId, fills: look.fills }),
    strokes: look.strokes,
    strokeWeight: look.strokeWeight,
    opacity: look.opacity,
    operation,
  };
}
