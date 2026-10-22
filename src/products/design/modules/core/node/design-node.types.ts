import type { CanvasElement, ElementDefaults } from "@canvas";
import type { Graphics } from "pixi.js";

import type { Paint } from "./paint.types";

/**
 * What every element of a design is: a layer with a name, a place in the layer tree, visibility,
 * opacity, fills and strokes. Coordinates stay in world units (not relative to the parent), so
 * moving a frame moves its descendants with it (`withMembers`) and everything else needs no
 * transform. Element types extend it with their own fields.
 */
export interface DesignNode extends CanvasElement {
  /** The layer's name in the layers panel (and above root frames). */
  name: string;
  /**
   * The frame (or other container) holding it, `null` at the top of the page. Siblings are
   * ordered by `index`; a parent draws before its children.
   */
  parentId: string | null;
  /**
   * The page it's on (see the pages module). A node added without one (`""`) goes on the page on
   * screen; a node and everything it holds are always on the same page.
   */
  pageId: string;
  /** Hidden layers aren't drawn or hit, but stay in the layers panel. */
  visible: boolean;
  /** 0–1. */
  opacity: number;
  /** Painted bottom to top. */
  fills: Paint[];
  strokes: Paint[];
  /** Stroke width in world units. */
  strokeWeight: number;
}

/** Values every design node starts with (`NODE_DEFAULTS`). */
export interface NodeDefaults extends ElementDefaults {
  opacity: number;
  strokeWeight: number;
  /** The stroke a node gets when one is added in the panel. */
  stroke: Paint;
}

/** How strokes end and turn corners (`drawPaints`). */
export interface StrokeShape {
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
}

/** What a node's paints follow: one outline, or separate ones for its fills and its strokes. */
export type PaintOutline =
  ((g: Graphics) => void) | { fill: (g: Graphics) => void; stroke: (g: Graphics) => void };
