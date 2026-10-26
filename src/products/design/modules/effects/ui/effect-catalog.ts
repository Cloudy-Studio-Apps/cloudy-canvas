import type { ComponentType } from "react";
import {
  Blinds,
  Droplet,
  GlassWater,
  Grip,
  Sparkles,
  SquareSquare,
  SquareStack,
} from "lucide-react";

import { createEffect } from "../create-effect";
import type { DesignEffect, DesignEffectType } from "../effect.types";
import {
  BackgroundBlurEditor,
  GlassEditor,
  LayerBlurEditor,
  NoiseEditor,
  ShadowEditor,
  TextureEditor,
} from "./editors";
import type { EffectEditorProps, EffectTypeEntry } from "./effects.points.types";
import { defineEffectType } from "./define-effect-type";

const percent = (n: number) => `${Math.round(n * 100)}%`;
const round = (n: number) => String(Math.round(n * 100) / 100);

/** One built-in type's entry, typed by its effect. */
function entry<T extends DesignEffectType>(
  type: T,
  label: string,
  icon: EffectTypeEntry["icon"],
  order: number,
  summary: (effect: Extract<DesignEffect, { type: T }>) => string,
  editor: ComponentType<EffectEditorProps<Extract<DesignEffect, { type: T }>>>,
): EffectTypeEntry {
  return defineEffectType({
    type,
    label,
    icon,
    order,
    create: () => createEffect(type),
    summary,
    editor,
  });
}

/** The built-in effects in the "+" menu, as in Figma's (the shader's comes from its module). */
export const EFFECT_CATALOG: readonly EffectTypeEntry[] = [
  entry(
    "inner-shadow",
    "Inner shadow",
    SquareSquare,
    10,
    (e) => `${round(e.x)}, ${round(e.y)} · ${round(e.blur)} blur · ${percent(e.opacity)}`,
    ShadowEditor,
  ),
  entry(
    "drop-shadow",
    "Drop shadow",
    SquareStack,
    20,
    (e) => `${round(e.x)}, ${round(e.y)} · ${round(e.blur)} blur · ${percent(e.opacity)}`,
    ShadowEditor,
  ),
  entry(
    "layer-blur",
    "Layer blur",
    Droplet,
    30,
    (e) =>
      e.progressive
        ? `Progressive · ${round(e.startRadius)} → ${round(e.radius)}`
        : round(e.radius),
    LayerBlurEditor,
  ),
  entry(
    "background-blur",
    "Background blur",
    Blinds,
    40,
    (e) => round(e.radius),
    BackgroundBlurEditor,
  ),
  entry(
    "noise",
    "Noise",
    Sparkles,
    50,
    (e) => `${e.noiseType[0]!.toUpperCase()}${e.noiseType.slice(1)} · ${percent(e.density)}`,
    NoiseEditor,
  ),
  entry(
    "texture",
    "Texture",
    Grip,
    60,
    (e) => `${round(e.size)} · ${round(e.radius)}`,
    TextureEditor,
  ),
  entry(
    "glass",
    "Glass",
    GlassWater,
    70,
    (e) => `${percent(e.refraction)} · ${round(e.frost)} frost`,
    GlassEditor,
  ),
];
