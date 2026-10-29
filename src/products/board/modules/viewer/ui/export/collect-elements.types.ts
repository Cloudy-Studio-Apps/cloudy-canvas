import type { CanvasElement } from "@canvas";

/** The board's elements as the file carries them. */
export interface CollectedElements {
  /** Bottom to top, with placeholders in place of what the viewer can't draw. */
  elements: CanvasElement[];
  /** The placeholders' pictures: asset id → SVG file. */
  placeholderSvgs: Record<string, string>;
  /** Plugin name → how many of its elements show as placeholders. */
  placeholders: Map<string, number>;
  /** Plugin id → the element types of it the file draws (plugins with `activateViewer`). */
  pluginTypes: Map<string, Set<string>>;
}
