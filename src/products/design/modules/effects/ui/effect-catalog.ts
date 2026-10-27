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
import { t } from "../effects.i18n";

const percent = (n: number) => `${Math.round(n * 100)}%`;
const round = (n: number) => String(Math.round(n * 100) / 100);

const shadowSummary = (e: { x: number; y: number; blur: number; opacity: number }) =>
  t("summary.shadow", {
    x: round(e.x),
    y: round(e.y),
    blur: round(e.blur),
    opacity: percent(e.opacity),
  });

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
    t("types.innerShadow"),
    SquareSquare,
    10,
    (e) => shadowSummary(e),
    ShadowEditor,
  ),
  entry(
    "drop-shadow",
    t("types.dropShadow"),
    SquareStack,
    20,
    (e) => shadowSummary(e),
    ShadowEditor,
  ),
  entry(
    "layer-blur",
    t("types.layerBlur"),
    Droplet,
    30,
    (e) =>
      e.progressive
        ? t("summary.progressive", { start: round(e.startRadius), end: round(e.radius) })
        : round(e.radius),
    LayerBlurEditor,
  ),
  entry(
    "background-blur",
    t("types.backgroundBlur"),
    Blinds,
    40,
    (e) => round(e.radius),
    BackgroundBlurEditor,
  ),
  entry(
    "noise",
    t("types.noise"),
    Sparkles,
    50,
    (e) => t("summary.noise", { mode: t(`editors.${e.noiseType}`), density: percent(e.density) }),
    NoiseEditor,
  ),
  entry(
    "texture",
    t("types.texture"),
    Grip,
    60,
    (e) => `${round(e.size)} · ${round(e.radius)}`,
    TextureEditor,
  ),
  entry(
    "glass",
    t("types.glass"),
    GlassWater,
    70,
    (e) => t("summary.glass", { refraction: percent(e.refraction), frost: round(e.frost) }),
    GlassEditor,
  ),
];
