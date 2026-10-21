import type { ArrowHead, ConnectorStyle } from "@board";

export interface ConnectorStyleItem {
  style: ConnectorStyle;
  label: string;
}

export interface ConnectorHeadItem {
  start: ArrowHead;
  end: ArrowHead;
  label: string;
  glyph: string;
}
