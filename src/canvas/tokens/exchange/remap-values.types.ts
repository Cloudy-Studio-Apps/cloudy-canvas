/** How `remapValues` renames a variable's references and modes. */
export interface ValueRemap {
  /** A record id (variable, axis) where the variable comes from → the target's. */
  idOf: (id: string) => string;
  /** A mode id where the variable comes from → the target's. */
  modeOf: (id: string) => string;
  /** The first mode of the variable's axis where it comes from (what its default stands for). */
  sourceBase: string | undefined;
  /** The first mode of an axis (by its target id) the target has already; `undefined` for a new one. */
  targetBaseOf: (axisId: string) => string | undefined;
}
