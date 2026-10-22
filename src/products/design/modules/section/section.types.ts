import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

/**
 * A section: a big labeled area that organizes frames on the page (Figma's sections). It holds
 * what's drawn or dropped in it, never clips, and only goes into other sections.
 */
export interface SectionElement extends DesignNode {
  type: "section";
}

export interface SectionDefaults extends ElementDefaults {
  size: Size;
  fill: string;
  /** Corner radius of the area. */
  radius: number;
  /** The name pill at its top-left corner. */
  title: {
    fontSize: number;
    color: string;
    background: string;
    border: string;
    padX: number;
    padY: number;
    /** Distance from the section's corner. */
    inset: number;
    radius: number;
  };
}
