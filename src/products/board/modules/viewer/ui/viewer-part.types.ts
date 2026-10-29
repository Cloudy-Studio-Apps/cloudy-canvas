import type { ComponentType } from "react";

import type { CanvasDocument, CanvasElement } from "@canvas";

/** A part's toggle in the viewer's brand bar. */
export interface ViewerPartButton {
  /** An SVG document, drawn at the text's size (the viewer has no icon library). */
  icon: { svg: string };
  label: string;
  /** Position among the toggles, lowest first. Built-ins are spaced by 10. */
  order: number;
}

/** What a part's panel is given. */
export interface ViewerPanelProps<D = unknown> {
  /** What the part's `collect` returned when the board was exported. */
  data: D;
  /** The element whose click opened the panel, `null` when its button did. */
  element: CanvasElement | null;
  close(): void;
}

/**
 * What a module adds to the board's HTML viewer: data gathered when exporting (in the app) and,
 * in the file, a toggle, a panel and what a click on its elements does. Contributed to
 * `boardViewerParts` by the module (for `collect`) and by its `.viewer.ts` module (for the rest).
 */
export interface ViewerPart<D = unknown> {
  id: string;
  /** Export time, in the app: what the file carries for this part; `null` leaves the part out. */
  collect(doc: CanvasDocument): D | null;
  /** Its toggle in the brand bar (a part without one only reacts to clicks). */
  button?: ViewerPartButton;
  /** Element types whose click this part handles. */
  types: readonly string[];
  /** The side panel. */
  panel?: ComponentType<ViewerPanelProps<D>>;
  /** What a click on one of `types` does instead of opening the panel (e.g. open a link). */
  click?(el: CanvasElement): void;
}
