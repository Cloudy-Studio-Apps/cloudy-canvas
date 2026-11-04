import type { DataField } from "../../source";
import type { FieldLeafNode } from "./field-tree.types";

export interface FieldLeafRowProps {
  node: FieldLeafNode;
  depth: number;
  /** Its value in the first row, as the design would show it. */
  sample: string;
  /** An image field whose pictures aren't saved in the file yet: an Update downloads them. */
  needsUpdate: boolean;
  /** Open, for a list of objects: its items' fields show under it. */
  open: boolean;
  onToggle: () => void;
  onChange: (field: DataField) => void;
}
