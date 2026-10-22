import type { CanvasElement, ElementDefaults, Size } from "@canvas";

/**
 * A titled area that groups what's inside it. Membership is geometric: the elements fully inside
 * a section belong to it (see `withSectionMembers`), so nothing stores parent links.
 */
export interface SectionElement extends CanvasElement {
  type: "section";
  /** The section's title. */
  text: string;
  color: string;
}

export interface SectionDefaults extends ElementDefaults {
  size: Size;
  fontSize: number;
  /** Height of the title strip along the top edge. */
  titleHeight: number;
  /** Space left of the title, and room right of it that still counts as the title. */
  titlePadding: number;
  /** How close to the border counts as grabbing the section. */
  borderReach: number;
  /** Smallest size a section is drawn at with the tool. */
  minSize: number;
}
