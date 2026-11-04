import type { DataField } from "../../source";

/** A field of the source, where it sits in the tree. */
export interface FieldLeafNode {
  kind: "field";
  /** Its key in the tree (its path). */
  id: string;
  field: DataField;
  /** Its place in the source's `fields`, for edits. */
  index: number;
  /** The last key of its path, shown when it has no alias. */
  name: string;
  /**
   * For a list of objects (a product's reviews), the fields inside each item, guessed from the
   * rows: read only, they're used by repeating a card inside a card.
   */
  inner?: DataField[];
}

/** An object in each row (`dimensions`), holding the fields under it. */
export interface FieldGroupNode {
  kind: "group";
  id: string;
  name: string;
  children: FieldTreeNode[];
}

export type FieldTreeNode = FieldLeafNode | FieldGroupNode;
