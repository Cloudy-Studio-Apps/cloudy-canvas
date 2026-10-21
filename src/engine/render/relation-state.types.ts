import type { EnumLink, Relation, RelationPath } from "../db";
import type { ErLink } from "../er";

/** Database relations to draw under the shapes. */
export interface RelationState {
  relations: readonly Relation[];
  /** Columns linked to the enum they're typed with. */
  enumLinks: readonly EnumLink[];
  /** Lines of ER diagrams. */
  erLinks: readonly ErLink[];
  /** Tables whose relations are highlighted (the selection). */
  highlighted: ReadonlySet<string>;
  /** The relation being dragged out of a column handle. */
  draft: RelationPath | null;
}
