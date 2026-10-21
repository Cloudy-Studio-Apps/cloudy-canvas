import type { Relation, RelationPath } from "../db";

/** Database relations to draw under the shapes. */
export interface RelationState {
  relations: readonly Relation[];
  /** Tables whose relations are highlighted (the selection). */
  highlighted: ReadonlySet<string>;
  /** The relation being dragged out of a column handle. */
  draft: RelationPath | null;
}
