import type { DbCardElement } from "../../card";

/**
 * A link between two cards, pointing from the table that holds the column to the card it names
 * (the referenced table, or the enum the column is typed with). Offsets are the heights of the
 * linked rows below each card's top edge.
 */
export interface SchemaEdge {
  from: string;
  to: string;
  fromOffset: number;
  toOffset: number;
}

/** The schema's tables and enums with the relations and enum links between them. */
export interface SchemaGraph {
  nodes: Map<string, DbCardElement>;
  edges: SchemaEdge[];
  /** Cards linked to each card, either way. */
  neighbors: Map<string, Set<string>>;
}

/** A card's space on the board: its bounds plus the note bubbles beside it. */
export interface CardFootprint {
  w: number;
  h: number;
}
