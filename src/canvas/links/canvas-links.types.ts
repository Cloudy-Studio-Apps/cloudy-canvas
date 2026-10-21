import type { Graphics } from "pixi.js";

import type { CanvasElement } from "../elements";
import type { CanvasTheme } from "../render/canvas-theme.types";

/** What links are drawn with on each frame. */
export interface LinkView {
  zoom: number;
  theme: CanvasTheme;
  /** Selected element ids: links touching them are highlighted. */
  highlighted: ReadonlySet<string>;
}

/**
 * Lines a product derives from its elements and draws under them (e.g. database relations).
 * They aren't elements: they follow the elements they join and are never selected.
 */
export interface CanvasLinks {
  /** The canvas elements changed (bottom to top): re-resolve what to draw. */
  update(elements: readonly CanvasElement[]): void;
  /** Draws every link, in world units. */
  draw(g: Graphics, view: LinkView): void;
}

/**
 * Temporary feedback a tool draws above the elements while a gesture runs (e.g. the relation
 * being dragged), in world units.
 */
export type Guide = (g: Graphics, view: Omit<LinkView, "highlighted">) => void;
