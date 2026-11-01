/** A line between two `TableCard` rows, by their ids. */
export interface KeyWire {
  from: string;
  to: string;
  /** A fork at `to`, where there can be many; a bar where there's only one. */
  many: boolean;
}

export interface KeyWiresProps {
  wires: readonly KeyWire[];
}
