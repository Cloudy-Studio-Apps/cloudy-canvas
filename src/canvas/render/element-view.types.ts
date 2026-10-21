/** How `placeImage` fits an image in its box: whole and centered, or filling it and cropped. */
export type ImageFit = "contain" | "cover";

/** The text the DOM editor is showing instead of the canvas: an element's, or one part of it. */
export interface HiddenText {
  id: string;
  /** The text part being edited (e.g. a table cell), or `null` for the element's only text. */
  part: string | null;
}
