import type { PathOperation } from "@canvas";

import type { DesignNode } from "../core";

/** How a boolean combines its layers, as in Figma. */
export type BooleanOperation = PathOperation;

/**
 * A boolean: its children (operands, bottom to top) combined into one shape it draws with its own
 * fills and strokes; the operands aren't drawn on their own and stay editable. Its bounds and
 * shape are resolved from them on every change (the stored ones are stale).
 */
export interface BooleanElement extends DesignNode {
  type: "boolean";
  operation: BooleanOperation;
}
