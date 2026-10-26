import type { ArrowHead, ConnectorStyle } from "../connector.types";

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
