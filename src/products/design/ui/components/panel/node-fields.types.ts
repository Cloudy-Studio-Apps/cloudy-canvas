import type { ReactNode } from "react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "@design";

/** What every field bound to the selected nodes takes. */
interface NodeFieldProps<N extends DesignNode, T> {
  nodes: readonly N[];
  /** Names the field (screen readers, tooltip). */
  label: string;
  /** A node's value (the field shows "Mixed" when they differ). */
  read: (node: N) => T;
  /** The patch that gives a node the new value (all of them change in one undo step). */
  patch: (value: T, node: N) => ElementPatch<DesignNode>;
}

export interface NodeNumberFieldProps<N extends DesignNode> extends NodeFieldProps<N, number> {
  prefix: ReactNode;
  suffix?: string;
  min?: number;
  max?: number;
  className?: string;
}

export interface NodeSelectFieldProps<N extends DesignNode> extends NodeFieldProps<N, string> {
  options: readonly { value: string; label: string }[];
}

export type NodeCheckboxProps<N extends DesignNode> = NodeFieldProps<N, boolean>;

/** One choice of `NodeOptionButtons`. */
export interface NodeOption {
  value: string;
  label: string;
  icon: ReactNode;
}

export interface NodeOptionButtonsProps<N extends DesignNode> extends NodeFieldProps<N, string> {
  options: readonly NodeOption[];
}
