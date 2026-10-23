import type {
  BlendMode,
  BoxSides,
  CanvasEffect,
  CanvasElement,
  ElementDefaults,
  MaskMode,
  PathShape,
  StrokeAlign,
} from "@canvas";
import type { Graphics } from "pixi.js";

import type { NodeSizing, SizeLimits } from "./node-layout.types";
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
  /** 0–1. On a frame or group it covers what it holds too, drawn together first. */
  opacity: number;
  /** How it blends with what's under it (see `LayerBlendMode`). */
  blendMode: LayerBlendMode;
  /** Painted bottom to top. */
  fills: Paint[];
  strokes: Paint[];
  /**
   * Stroke width in world units (with `strokeWeights`, the widest side's, so "has a stroke" checks
   * still read it).
   */
  strokeWeight: number;
  /** Where its strokes sit on a closed outline (open paths are always centered). */
  strokeAlign: StrokeAlign;
  /** How open ends and dashes end. */
  strokeCap: StrokeCap;
  /** How corners are joined. */
  strokeJoin: StrokeJoin;
  /** Corners sharper than this (degrees) are beveled instead of mitered, as in Figma. */
  strokeMiterAngle: number;
  /** Dash, gap, dash, gap… lengths in world units; empty for a solid stroke. */
  strokeDashes: number[];
  /**
   * Each side's own weight (Figma's individual strokes), on kinds with `sidedStrokes`; `null`
   * when every side has `strokeWeight`.
   */
  strokeWeights: BoxSides | null;
  /**
   * Whether it's a mask: it isn't drawn, and the siblings above it (up to the next mask) show
   * only through it, as in Figma.
   */
  isMask: boolean;
  /** How it masks (see `MaskType`). */
  maskType: MaskType;
  /** Whether what it masks shows only outside it (a cut-out) instead of inside it. */
  maskInverted: boolean;
  /**
   * Its effects, bottom to top (shadows, blurs, noise, glass, shaders; see the effects module):
   * drawn over it and what it holds, together.
   */
  effects: NodeEffect[];
  /**
   * How its width and height are decided in an auto layout (see `NodeSizing`). A text's hugging
   * follows its `autoResize`, so it stores only `fill` or `fixed`.
   */
  sizing: NodeSizing;
  /** Whether its auto layout parent leaves it where it is (Figma's "Ignore auto layout"). */
  layoutAbsolute: boolean;
  /** How small and large an auto layout may make it, or `null` without limits. */
  sizeLimits: SizeLimits | null;
}

/**
 * One effect of a node: a `CanvasEffect` (its `type` names the renderer that draws it) with the
 * type's own fields. The effects module defines the built-in types; plugins add their own.
 */
export type NodeEffect = CanvasEffect & Record<string, unknown>;

/**
 * A layer's blend mode, Figma's: one of the canvas's `BlendMode`s, or `pass-through` (the
 * default), where a frame's or group's layers blend with what's behind it as if it weren't
 * there. On a layer that holds nothing, pass-through is normal.
 */
export type LayerBlendMode = "pass-through" | BlendMode;

/**
 * How a mask shapes what it masks: by its opacity (`alpha`), by its outline alone (`vector`) or
 * by its brightness (`luminance`).
 */
export type MaskType = MaskMode;

/** Values every design node starts with (`NODE_DEFAULTS`). */
export interface NodeDefaults extends ElementDefaults {
  opacity: number;
  strokeWeight: number;
  /** Where new nodes' strokes sit (lines and vectors center theirs). */
  strokeAlign: StrokeAlign;
  strokeCap: StrokeCap;
  strokeJoin: StrokeJoin;
  /** Figma's default miter angle (a miter limit of 4). */
  strokeMiterAngle: number;
  /** The stroke a node gets when one is added in the panel. */
  stroke: Paint;
  /** How a layer made a mask masks. */
  maskType: MaskType;
}

/** How a stroke's open ends and dashes end (Figma's names: `none` is a flat end at the point). */
export type StrokeCap = "none" | "round" | "square";

/** How a stroke turns corners. */
export type StrokeJoin = "miter" | "bevel" | "round";

/** How Pixi strokes a path (`drawPaints`): its ends, corners and miter limit (a ratio). */
export interface StrokeShape {
  cap?: "butt" | "round" | "square";
  join?: "miter" | "round" | "bevel";
  miterLimit?: number;
}

/**
 * How a node's strokes are drawn (`DesignNodeKind.strokeOf`): Pixi strokes along `path` (a
 * centered stroke, the fast way) or the stroke's `area` filled (aligned, dashed inside or
 * outside, or with sides of their own).
 */
export type NodeStroke =
  | { kind: "path"; path: PathShape; width: number; shape: StrokeShape }
  | { kind: "area"; area: PathShape };

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
