import type { ReactNode } from "react";

import type { FieldGroupNode } from "./field-tree.types";

export interface FieldGroupRowProps {
  node: FieldGroupNode;
  depth: number;
  /** How many fields it holds, all levels. */
  count: number;
  open: boolean;
  onToggle: () => void;
  /** Its fields, shown while it's open. */
  children: ReactNode;
}
