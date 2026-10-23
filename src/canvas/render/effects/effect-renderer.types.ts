import type { Texture } from "pixi.js";

import type { CanvasEffect } from "../../effects";
import type { Rect } from "../../geometry.types";
import type { EffectShader } from "./effect-shader";

/**
 * When an effect is drawn in the pipeline, in this order: what shows through from behind
 * (`backdrop`: background blur, glass), what's laid on the content (`content`: inner shadows,
 * noise, texture), what's cast behind it (`behind`: drop shadows) and what changes the whole
 * result (`filter`: layer blur, shaders). Effects of one stage go in list order.
 */
export type EffectStage = "backdrop" | "content" | "behind" | "filter";

/**
 * What a renderer draws with while a scope's effects are applied, on the GPU. Lengths are CSS
 * pixels of the filter's textures (`px` turns world units into them); textures from `texture()`,
 * `run` and `blur` go back to the pool when the scope is done.
 */
export interface EffectPass {
  /** The scope's content as drawn, before any effect. */
  readonly content: Texture;
  /**
   * What's behind the scope on the canvas, for renderers that read it (`backdrop`); a blank
   * texture otherwise.
   */
  readonly backdrop: Texture;
  /** CSS pixels per world unit (the zoom on screen, 1 in exports). */
  readonly scale: number;
  /** World lengths in CSS pixels. */
  px(world: number): number;
  /** A world offset (dx, dy) in the element's turned frame, in CSS pixels on screen. */
  offset(dx: number, dy: number): { x: number; y: number };
  /** The element's own box (unturned, world units). */
  readonly box: Rect;
  /**
   * The affine map (a, b, c, d, tx, ty: `x = a·u + c·v + tx`, `y = b·u + d·v + ty`) from texture
   * coordinates to the element's own coordinates (unturned, from its top-left corner), so a
   * shader can lay things on the element (progressive blur, noise that stays put, light).
   */
  readonly toLocal: readonly [number, number, number, number, number, number];
  /** A blank texture the size of the content. */
  texture(): Texture;
  /** Draws `shader` over `input` (its `uTexture`) into a new texture, or into `output`. */
  run(shader: EffectShader, input: Texture, output?: Texture): Texture;
  /** A Gaussian blur of `input` (`radius` is Figma's: twice the deviation, in CSS pixels). */
  blur(input: Texture, radius: number): Texture;
}

/**
 * How one type of effect is drawn: an engine-side piece a product contributes (the design's
 * shadows, blurs, noise, glass, shaders). It works on the GPU through `EffectPass`.
 */
export interface EffectRenderer<E extends CanvasEffect = CanvasEffect> {
  type: string;
  stage: EffectStage;
  /** Whether its effects may read what's behind the scope (the canvas then keeps a back buffer). */
  readonly backdrop?: boolean;
  /** Whether this effect does (a shader whose code reads it); `backdrop` when left out. */
  readsBackdrop?(effect: E): boolean;
  /**
   * How far past the content the result can show, in world units, given how far it did before
   * (`outset`): a shadow's reach is the most of either, a blur adds its own.
   */
  outset(effect: E, outset: number): number;
  /**
   * How far past the content it needs to read, in world units (a backdrop blur samples beyond
   * the shape); `outset` when left out.
   */
  margin?(effect: E): number;
  /** Draws the effect over `current` (the pipeline so far) and returns the new result. */
  render(pass: EffectPass, effect: E, current: Texture): Texture;
}

/** A product's effect renderers by type. */
export type EffectRenderers = ReadonlyMap<string, EffectRenderer>;
