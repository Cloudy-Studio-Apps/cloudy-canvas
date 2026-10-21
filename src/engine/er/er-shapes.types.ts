/** One ER diagram on the board. */
export interface ErDiagramInfo {
  id: string;
  /** From the text's `Diagram <name>` line; empty when it has none. */
  name: string;
  /** The name, or the first entities' names for an unnamed diagram. */
  label: string;
  entityCount: number;
}
