import type { ConnectorHeadItem, ConnectorStyleItem } from "./connector-option-items.types";

export const CONNECTOR_STYLES: ConnectorStyleItem[] = [
  { style: "elbow", label: "Elbow" },
  { style: "straight", label: "Straight" },
];

/** Arrowhead combinations, shown as small glyphs. */
export const CONNECTOR_HEADS: ConnectorHeadItem[] = [
  { start: "none", end: "arrow", label: "Arrow at end", glyph: "→" },
  { start: "arrow", end: "arrow", label: "Arrows at both ends", glyph: "↔" },
  { start: "none", end: "none", label: "No arrows", glyph: "—" },
];
