import type { ReactNode } from "react";

import type { DesignNode } from "@design";
import type { FieldBinding } from "../../hooks";

export interface BindButtonProps {
  binding: FieldBinding;
  className?: string;
}

export interface BindableNumberFieldExtra {
  /** The bound field's path (`"cornerRadius"`, `"layout.padding.top"`). */
  path: string;
}

export interface BindSlotProps {
  nodes: readonly DesignNode[];
  /** The bound field's path, or the paths set together (a padding pair). */
  path: string | readonly string[];
  className?: string;
  children: ReactNode;
}
