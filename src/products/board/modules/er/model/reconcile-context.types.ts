import type { ErAttributeElement, ErAttributeLook } from "../attribute/attribute.types";
import type { ErShapes } from "./lang";

/** Shared state while reconciling one parsed text against the board. */
export interface ReconcileContext {
  existing: ErShapes;
  /** Ids of shapes that don't exist on the board yet. */
  added: Set<string>;
  /** Every attribute built so far, for all owners. */
  attributes: ErAttributeElement[];
  look: ErAttributeLook;
  /** Entity and aggregation names → ids in the new model. */
  entityIds: Map<string, string>;
  relationIds: Map<string, string>;
}
