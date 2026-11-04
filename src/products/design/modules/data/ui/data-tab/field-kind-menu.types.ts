import type { ReactNode } from "react";

import type { DataField } from "../../source";

export interface FieldKindMenuProps {
  field: DataField;
  /** The button that opens it (the field's kind icon). */
  children: ReactNode;
  onChange: (field: DataField) => void;
  onRename: () => void;
}
