import type { DropShadowEffect, GlassEffect } from "./effect.types";
import { t } from "./effects.i18n";

/** Shadow elevations, from resting on the page to floating well above it. */
export const SHADOW_PRESETS: readonly {
  label: string;
  look: Pick<DropShadowEffect, "x" | "y" | "blur" | "spread" | "opacity">;
}[] = [
  { label: "1", look: { x: 0, y: 1, blur: 2, spread: 0, opacity: 0.12 } },
  { label: "2", look: { x: 0, y: 2, blur: 6, spread: 0, opacity: 0.14 } },
  { label: "3", look: { x: 0, y: 6, blur: 16, spread: -2, opacity: 0.16 } },
  { label: "4", look: { x: 0, y: 12, blur: 32, spread: -4, opacity: 0.18 } },
  { label: "5", look: { x: 0, y: 24, blur: 56, spread: -8, opacity: 0.22 } },
];

/** Glass looks: barely there, frosted, and Apple's liquid glass. */
export const GLASS_PRESETS: readonly {
  label: string;
  look: Omit<GlassEffect, "id" | "type" | "visible">;
}[] = [
  {
    label: t("presets.clear"),
    look: {
      lightAngle: 135,
      lightIntensity: 0.35,
      refraction: 0.3,
      depth: 10,
      dispersion: 0.1,
      frost: 0,
      splay: 0.3,
    },
  },
  {
    label: t("presets.frosted"),
    look: {
      lightAngle: 120,
      lightIntensity: 0.4,
      refraction: 0.2,
      depth: 12,
      dispersion: 0,
      frost: 12,
      splay: 0.6,
    },
  },
  {
    label: t("presets.liquid"),
    look: {
      lightAngle: 135,
      lightIntensity: 0.7,
      refraction: 0.8,
      depth: 24,
      dispersion: 0.4,
      frost: 2,
      splay: 0.5,
    },
  },
];
