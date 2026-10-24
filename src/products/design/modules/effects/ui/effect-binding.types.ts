import type { ReactNode } from "react";

import type { DesignNode } from "@design";

/** Which layers' effect an editor edits (one effect, at `index` of every one's stack). */
export interface EffectBindingTarget {
  nodes: readonly DesignNode[];
  index: number;
}

export interface EffectBindProps {
  /** The effect's field (`"x"`, `"color"`). */
  field: string;
  children: ReactNode;
}
