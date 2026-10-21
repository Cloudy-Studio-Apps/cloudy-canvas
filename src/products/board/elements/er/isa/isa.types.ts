import type { ErElementBase } from "../base/er.types";

/** One specialized entity of a hierarchy. */
export interface ErIsaChild {
  id: string;
  entityId: string;
  min: string;
  max: string;
}

/** A generalization / specialization ("ES UN" triangle) from a parent entity to its children. */
export interface ErIsaElement extends ErElementBase {
  type: "er-isa";
  parentId: string;
  /** Cardinality shown on the parent's line, or empty. */
  parentMin: string;
  parentMax: string;
  /** Exclusive (an arc under the triangle) rather than overlapping. */
  exclusive: boolean;
  /** Total (a small circle on the parent's line) rather than partial. */
  total: boolean;
  children: ErIsaChild[];
}
