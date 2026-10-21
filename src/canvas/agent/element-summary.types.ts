/** A compact view of an element for listings; `get_shapes` returns the full fields. */
export interface ElementSummary {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Text, title or name, when the element has one. */
  label?: string;
  /** Sub-kind, e.g. a geo element's variant. */
  kind?: string;
  /** The group it belongs to, e.g. the id of its ER diagram. */
  group?: string;
  /** The elements a line runs between (`null` for a free end). */
  from?: string | null;
  to?: string | null;
}
