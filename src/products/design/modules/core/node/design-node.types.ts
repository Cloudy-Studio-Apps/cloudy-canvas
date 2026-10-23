import type { CanvasElement, ElementDefaults, MaskMode, PathShape } from "@canvas";
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
  /**
   * Whether it's a mask: it isn't drawn, and the siblings above it (up to the next mask) show
   * only through it, as in Figma.
   */
  isMask: boolean;
  /** How it masks (see `MaskType`). */
  maskType: MaskType;
  /** Whether what it masks shows only outside it (a cut-out) instead of inside it. */
  maskInverted: boolean;
}

/**
 * How a mask shapes what it masks: by its opacity (`alpha`), by its outline alone (`vector`) or
 * by its brightness (`luminance`).
 */
export type MaskType = MaskMode;

/** Values every design node starts with (`NODE_DEFAULTS`). */
export interface NodeDefaults extends ElementDefaults {
  opacity: number;
  strokeWeight: number;
  /** The stroke a node gets when one is added in the panel. */
  stroke: Paint;
  /** How a layer made a mask masks. */
  maskType: MaskType;
}

/** How strokes end and turn corners (`drawPaints`). */
export interface StrokeShape {
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
}

/**
 * A node's shape in local coordinates: what its fills cover (normalized: outers and their holes)
 * and what its strokes follow. Drawing, hit tests, masks and booleans all read it.
 */
export interface NodeGeometry {
  fill: PathShape;
  stroke: PathShape;
}

/**
 * What a node's paints follow, traced by hand (plugins' kinds): one outline, or separate ones for
 * its fills and its strokes. Built-in kinds give a `NodeGeometry` instead.
 */
export type PaintOutline =
  ((g: Graphics) => void) | { fill: (g: Graphics) => void; stroke: (g: Graphics) => void };
