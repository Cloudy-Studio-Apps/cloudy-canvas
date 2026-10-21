import type { CanvasElement, ElementDefaults, Size } from "@canvas";

export interface StickyElement extends CanvasElement {
  type: "sticky";
  color: string;
  text: string;
  /** Set when the sticky is a DBML sticky note (`Note name { … }`), which makes it part of the schema. */
  noteName?: string;
}

export interface StickyDefaults extends ElementDefaults {
  size: Size;
  fontSize: number;
  /** Inner padding around the text. */
  padding: number;
}
