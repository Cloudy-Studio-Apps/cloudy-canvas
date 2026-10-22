import type { CanvasElement, ElementDefaults } from "@canvas";

/** A database card (table or enum): a named header over one row per item. */
export interface DbCardElement extends CanvasElement {
  name: string;
  headerColor: string;
}

export interface DbCardDefaults extends ElementDefaults {
  fontSize: number;
  headerHeight: number;
  rowHeight: number;
  /** Space between the card edges and its text. */
  paddingX: number;
  /** Smaller text: badges, tags. */
  badgeFontSize: number;
}
