import type { Point } from "@canvas";

import type { NodeEffect } from "../core";

/** What every built-in effect has: its id, type and whether it shows. */
interface EffectBase<T extends string> extends NodeEffect {
  type: T;
}

/** A colored effect's color: a hex color and its opacity (0–1). */
interface Colored {
  color: string;
  opacity: number;
}

/** A shadow's placement: its offset, blur and spread, in world units. */
interface ShadowShape extends Colored {
  x: number;
  y: number;
  /** Figma's blur radius (twice the Gaussian's deviation). */
  blur: number;
  /** How much the shadow grows (or, negative, shrinks) before it's blurred. */
  spread: number;
}

/** A shadow cast behind the layer. */
export interface DropShadowEffect extends EffectBase<"drop-shadow">, ShadowShape {
  /** Shows the shadow through the layer's translucent parts too (Figma's "Show behind"). */
  showBehind: boolean;
}

/** A shadow cast inside the layer from its edges. */
export interface InnerShadowEffect extends EffectBase<"inner-shadow">, ShadowShape {}

/** The layer and what it holds blurred: evenly, or from `start` to `end` (progressive). */
export interface LayerBlurEffect extends EffectBase<"layer-blur"> {
  radius: number;
  progressive: boolean;
  /** Where a progressive blur starts and ends, in the layer's box (0–1 on each axis). */
  start: Point;
  end: Point;
  /** The blur at `start` (it grows to `radius` at `end`). */
  startRadius: number;
}

/** What's behind the layer blurred, showing through its translucent fills (frosted glass). */
export interface BackgroundBlurEffect extends EffectBase<"background-blur"> {
  radius: number;
}

/** Grain over the layer: one color, two, or many. */
export interface NoiseEffect extends EffectBase<"noise">, Colored {
  noiseType: "mono" | "duo" | "multi";
  /** Grain size, world units. */
  size: number;
  /** How much of the layer the grain covers (0–1). */
  density: number;
  /** The second color of `duo` grain. */
  secondColor: string;
}

/** The layer's edges and fills roughened, like paper or stone. */
export interface TextureEffect extends EffectBase<"texture"> {
  /** Grain size, world units. */
  size: number;
  /** How far edges are pushed, world units. */
  radius: number;
  /** Keeps the roughness inside the layer's shape. */
  clipToShape: boolean;
}

/** Liquid glass: what's behind refracted at the edges, frosted, lit along its rim. */
export interface GlassEffect extends EffectBase<"glass"> {
  /** Degrees the light comes from (0 is the right, counterclockwise). */
  lightAngle: number;
  /** 0–1. */
  lightIntensity: number;
  /** How much the edges bend what's behind (0–1). */
  refraction: number;
  /** How far in from the edges the glass curves, world units. */
  depth: number;
  /** Rainbow fringes at the edges (0–1). */
  dispersion: number;
  /** Blur of what's behind, world units. */
  frost: number;
  /** How wide the light's highlight spreads round the rim (0–1). */
  splay: number;
}

/** A custom fragment shader over the layer (Beta). */
export interface ShaderEffect extends EffectBase<"shader"> {
  /** GLSL: defines `vec4 effect(vec2 uv, vec2 local)` (see the shader effect module). */
  code: string;
  /** Values of the uniforms the code declares, by name. */
  params: Record<string, number | number[]>;
}

/** The built-in effects. */
export type DesignEffect =
  | DropShadowEffect
  | InnerShadowEffect
  | LayerBlurEffect
  | BackgroundBlurEffect
  | NoiseEffect
  | TextureEffect
  | GlassEffect
  | ShaderEffect;

export type DesignEffectType = DesignEffect["type"];
