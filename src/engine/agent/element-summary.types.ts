import type { ElementType } from "../elements";

/** A compact view of an element for listings; `get_shapes` returns the full fields. */
export interface ElementSummary {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Text, title or name, when the element has one. */
  label?: string;
  /** Sub-kind, e.g. a geo element's variant. */
  kind?: string;
}
