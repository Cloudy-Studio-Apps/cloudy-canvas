import type { DesignNode } from "./design-node.types";

/** The stroke settings agents give (`nodes_create`, `nodes_update`). */
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
