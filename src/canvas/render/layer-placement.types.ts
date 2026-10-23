import type { BlendMode, CanvasEffect } from "../effects";
import type { CanvasElement, ElementKind } from "../elements";
import type { Point, Rect } from "../geometry.types";
import type { PathShape } from "../path";
import type { EffectRenderers } from "./effects/effect-renderer.types";

/** An element's drawing order key: views are stacked by these, compared as strings. */
export type OrderKeyOf = (el: CanvasElement, kind: ElementKind) => string;

/**
 * The world area an element is drawn and hit in, when something clips it (e.g. a frame that
 * clips its content): a rect, with rounded corners of `radius`, turned by `rotation` degrees
 * around its top-left corner (a turned frame's).
 */
export interface ElementClip {
  rect: Rect;
  radius: number;
  rotation?: number;
}

/** An element's clip, or `null` when nothing clips it. */
export type ClipOf = (el: CanvasElement) => ElementClip | null;

/**
 * How a mask shapes what it masks: by its pixels' opacity (`alpha`), by its outline alone, fully
 * opaque wherever it has a shape (`vector`), or by its pixels' brightness (`luminance`).
 */
export type MaskMode = "alpha" | "vector" | "luminance";

/** Where an element is drawn under a mask: as part of the mask itself, or masked by it. */
export interface MaskSlot {
  mask: string;
  role: "source" | "masked";
}

/** Where an element is drawn inside an element's effects (it, or something it holds). */
export interface EffectSlot {
  /** The element whose effects the scope applies. */
  effect: string;
}

/**
 * The innermost container an element is drawn in: a mask's scope or an effect scope. Scopes nest
 * (a masked group with a shadow, a shadowed layer under a mask), each with its own `home`.
 */
export type ScopeSlot = MaskSlot | EffectSlot;

/** One outline of a vector mask, in its element's own frame (see `ElementMask.shape`). */
export interface MaskShape {
  /** The element's top-left corner, in world units. */
  x: number;
  y: number;
  /** Degrees counterclockwise round (x, y). */
  rotation: number;
  /** What it covers, in local coordinates (holes stay open). */
  path: PathShape;
}

/**
 * An element that masks others: they show only where it does (or, `inverted`, only where it
 * doesn't). The mask isn't drawn itself; with what it holds (its `source` slot) it shapes the mask.
 */
export interface ElementMask {
  /** The mask element. */
  id: string;
  mode: MaskMode;
  inverted: boolean;
  /** Where the mask and what it masks are drawn: inside another scope, or `null` at the top. */
  home: ScopeSlot | null;
  /** The world area the mask covers (where what it masks can show). */
  bounds: Rect;
  /**
   * Its outlines, for a `vector` mask (drawn crisp, as a stencil); `null` when some part of it has
   * no outline (a text), which then masks by its pixels made fully opaque.
   */
  shape: readonly MaskShape[] | null;
  /** Whether a world point is inside the mask's shape (what it masks can be clicked there). */
  contains(p: Point): boolean;
}

/** The masks of a canvas, and where each element under one is drawn. */
export interface ElementMasks {
  masks: ReadonlyMap<string, ElementMask>;
  /** Elements under a mask → their innermost slot; elements left out are under none. */
  homes: ReadonlyMap<string, ScopeSlot>;
}

/**
 * An element's effects and where they're drawn: over the element's view and the views of what it
 * holds, composited together (a group's shadow is its layers' shadow, as in Figma).
 */
export interface EffectScope {
  /** The element. */
  id: string;
  /** Its visible effects, bottom to top. */
  effects: readonly CanvasEffect[];
  /** Where the scope is drawn: inside another scope, or `null` at the top. */
  home: ScopeSlot | null;
  /** The element's own box (unturned; x, y its top-left corner): effects laid on it use it. */
  box: Rect;
  /** Degrees the element is turned by (counterclockwise round its corner): offsets turn with it. */
  rotation: number;
  /** The world area of what the scope holds, effects left out. */
  bounds: Rect;
  /**
   * How the scope's result is laid on what's behind it: a group's opacity, a layer's blend mode.
   * Left out, it's drawn as it is.
   */
  composite?: ScopeComposite;
}

/**
 * The opacity and blend mode a scope's result is composited with (after its effects). An
 * `isolated` scope is drawn on its own first, then composited (what it holds overlaps, or it
 * blends); otherwise its opacity is just handed down to what it holds, which looks the same.
 */
export interface ScopeComposite {
  opacity: number;
  blendMode: BlendMode;
  isolated: boolean;
}

/**
 * The effect scopes of a canvas, and the elements whose innermost slot is one. An element's
 * slot is `homes`' here, else the masks' (a product gives both consistently).
 */
export interface ElementEffects {
  scopes: ReadonlyMap<string, EffectScope>;
  homes: ReadonlyMap<string, EffectSlot>;
}

/** Where an element layer puts each view: its place in the stack, its clip, masks and effects. */
export interface LayerPlacement {
  orderOf: OrderKeyOf;
  clipOf: ClipOf;
  masks: () => ElementMasks;
  effects: () => ElementEffects;
  /** The product's effect renderers by type (effects of other types aren't drawn). */
  effectRenderers: EffectRenderers;
  /** Whether a view is drawn (not when its element is drawn by another, e.g. a boolean's). */
  drawn: (el: CanvasElement) => boolean;
}
