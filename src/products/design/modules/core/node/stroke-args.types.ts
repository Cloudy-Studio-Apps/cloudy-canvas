import type { DesignNode } from "./design-node.types";

/** The stroke settings agents give (`create_nodes`, `update_nodes`). */
export type StrokeFields = Partial<
  Pick<
    DesignNode,
    | "strokeWeight"
    | "strokeAlign"
    | "strokeCap"
    | "strokeJoin"
    | "strokeMiterAngle"
    | "strokeDashes"
    | "strokeWeights"
  >
>;
